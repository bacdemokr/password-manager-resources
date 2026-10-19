// 랜덤한 기능 간단하게 하나 추가해봐
// PM → Dev. 2026-10-19T02:55:19.857Z

// Usage: node random-password-generator.js
'use strict';

const crypto = require('crypto');

const CHARACTER_SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.?'
};

function validateLength(length) {
  if (!Number.isInteger(length) || length < 1) {
    throw new RangeError('Password length must be a positive integer.');
  }

  if (length > 1024) {
    throw new RangeError('Password length must not exceed 1024 characters.');
  }
}

function getEnabledSets(options) {
  if (options === undefined) {
    return Object.keys(CHARACTER_SETS);
  }

  if (options === null || typeof options !== 'object' || Array.isArray(options)) {
    throw new TypeError('Password options must be an object.');
  }

  const enabledSets = [];

  for (const name of Object.keys(CHARACTER_SETS)) {
    if (options[name] !== undefined && typeof options[name] !== 'boolean') {
      throw new TypeError(`Option "${name}" must be a boolean.`);
    }

    if (options[name] === true) {
      enabledSets.push(name);
    }
  }

  if (enabledSets.length === 0) {
    throw new Error('At least one character set must be enabled.');
  }

  return enabledSets;
}

function secureShuffle(characters) {
  for (let index = characters.length - 1; index > 0; index -= 1) {
    const swapIndex = crypto.randomInt(index + 1);
    const temporary = characters[index];
    characters[index] = characters[swapIndex];
    characters[swapIndex] = temporary;
  }

  return characters;
}

function generatePassword(length, options) {
  validateLength(length);

  const enabledSets = getEnabledSets(options);

  if (length < enabledSets.length) {
    throw new RangeError(
      `Password length must be at least ${enabledSets.length} to include every enabled character set.`
    );
  }

  const alphabet = enabledSets.map((name) => CHARACTER_SETS[name]).join('');
  const passwordCharacters = enabledSets.map((name) => {
    const characterSet = CHARACTER_SETS[name];
    return characterSet[crypto.randomInt(characterSet.length)];
  });

  while (passwordCharacters.length < length) {
    passwordCharacters.push(alphabet[crypto.randomInt(alphabet.length)]);
  }

  return secureShuffle(passwordCharacters).join('');
}

function runSelfTest() {
  const password = generatePassword(16, {
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true
  });

  if (
    password.length !== 16 ||
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/[0-9]/.test(password) ||
    !/[!@#$%^&*()\-_=+\[\]{};:,.?]/.test(password)
  ) {
    throw new Error('Self-test failed: generated password does not meet requested options.');
  }

  return true;
}

module.exports = {
  generatePassword,
  runSelfTest,
  CHARACTER_SETS
};

if (require.main === module) {
  runSelfTest();

  console.log(generatePassword(16, {
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true
  }));
}
