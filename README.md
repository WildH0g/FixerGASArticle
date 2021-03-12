# Using Design Patterns in Google Apps Script

## Introduction

A lot of the code written in Google Apps Script that I come across on StackOverflow and other sites lacks best practices, hence I thought it was time to start bringing them up and I will start today with design patterns.

This example here uses [Fixer.io](http://fixer.com?fpr=dmitry16) API to download Forex data into a Google Spreaddsheet.

## Detailed explanation

This code is explained in [my article on Medium](https://medium.com/@dmitry.kostyuk/using-design-patterns-in-google-apps-script-ceaa7606d2d6)

Objective: illusrate use of design patterns in the Google Apps Script environment.

The design patterns used are: Façade, Adapter, Proxy

## How to use

The code an be used as-is with one exception: the apiKey variable is not pushed here, you need to set your API key to `const apiKey = 'your_api_key` in the `main()` function.

To support me, if you will be sigin up with Fixer, I will appreciate if you use [my affiliate link](http://fixer.com?fpr=dmitry16)