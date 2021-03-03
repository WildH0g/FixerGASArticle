//jshint esversion: 8
function onOpen() {
  SpreadsheetApp
    .getUi()
    .createMenu('SATAWAD')
    .addItem('Mettre à jour', 'main')
    .addToUi();
}

function main() {
  const symbols = ['USD', 'AUD', 'CAD', 'PLN', 'MXN'];
  const base = 'EUR';
  const forexProxy = new ForexProxy(symbols, apiKey, base);
  const dates = new DateGenerator(5);
  const sheet = new Sheet();

  const values = sheet.getValues();
  forexProxy.cache(sheet.getKeys(values), values);

  const sheetAr = [
    ['Date', 'EUR/USD', 'EUR/AUD', 'EUR/CAD', 'EUR/PLN', 'EUR/MXN']
  ];

  dates.forEach((date, i) => {
    const endpoint = 0 === i ? undefined : date;
    const row = forexProxy.get(endpoint);
    sheetAr.push(row);
  });

  sheet.overwrite(sheetAr);
}

const Forex = (function () {
  const _url = 'http://data.fixer.io/api/';

  function _fetch(endpoint, symbols, apiKey, base) {
    if (!endpoint) endpoint = 'latest';
    const req = `${_url}${endpoint}?access_key=${apiKey}&base=${base}&symbols=${symbols}`;
    return UrlFetchApp.fetch(req);
  }

  const fetch = new WeakMap();
  class Forex {
    constructor(symbols, apiKey, base) {
      this.symbols = symbols;
      this.apiKey = apiKey;
      this.base = base;
      fetch.set(this, _fetch);
    }
    get(endpoint) {
      Logger.log(`Fetching external API data for endpoint ${endpoint || 'latest'}`);
      return fetch.get(this)(endpoint, this.symbols.join(','), this.apiKey, this.base);
    }
  }
  return Forex;
})();

class FixerAdapter {
  constructor(symbols, apiKey, base) {
    this.symbols = symbols;
    this.forex = new Forex(symbols, apiKey, base);
  }
  toArray(endpoint) {
    const fixerResponse = this.forex.get(endpoint);
    const { success, date, rates } = JSON.parse(fixerResponse);
    // {"success":false,"error":{"code":302,"type":"invalid_date","info":"You have entered an invalid date. [Required format: date=YYYY-MM-DD]"}}
    if (!Boolean(success)) {
      throw new Error('Fixer Error : ' + fixerResponse);
    }
    const row = [date];
    this.symbols.forEach(curr => {
      row.push(rates[curr]);
    });
    return row;
  }
}

const ForexProxy = (function () {

  const _registry = new WeakMap();

  class ForexProxy {
    constructor(symbols, apiKey, base) {
      this.forexAdapter = new FixerAdapter(symbols, apiKey, base);
      _registry.set(this, []);
    }

    cache(arKeys, arValues) {
      const reg = _registry.get(this);
      arKeys.forEach((key, i) => {
        if(i > 0) {
          const _obj = {
            key,
            vals: arValues[i]
          };
          reg.push(_obj);
        }
      });
    }

    get(endpoint) {
      const toString = (date) => (new Date(date)).toDateString();
      const registryData = this.registry.filter(row => {
        if (toString(row.key) === toString(endpoint)) {
          Logger.log(`returning cached data for endpoint ${endpoint}`);
          return row;
        }
      });

      if (!registryData.length) {
        return this.forexAdapter.toArray(endpoint);
      }

      return registryData[0].vals;
    }

    get registry() {
      return _registry.get(this);
    }
  }

  return ForexProxy;

})();

class DateGenerator {
  constructor(days) {
    const dates = [];
    for (let i = 0; i < days; i++) {
      const now = new Date();
      const _date = new Date(now.setDate(now.getDate() - i));
      let month = _date.getMonth() + 1;
      if (month < 10) month = `0${month}`;
      let date = _date.getDate();
      if (date < 10) date = `0${date}`;
      const _formattedDate = `${_date.getFullYear()}-${month}-${date}`;
      dates.push(_formattedDate);
    }
    return dates;
  }
}

const Sheet = (function () {

  class Sheet {
    constructor() {
      this.ss = SpreadsheetApp.getActiveSpreadsheet();
      this.ws = this.ss.getSheets()[0];
    }

    getKeys(values, index = 0) {
      return values.map(row => row[index]);
    }

    getValues() {
      return this.ws
        .getDataRange()
        .getValues();
    }

    overwrite(ar) {
      this.ws
        .clear()
        .getRange(1, 1, ar.length, ar[0].length)
        .setValues(ar);
    }
  }

  return Sheet;
})();




















//