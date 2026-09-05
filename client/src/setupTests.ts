// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// react-router-dom v7 needs TextEncoder/TextDecoder, which CRA's jsdom test
// environment doesn't provide as globals.
Object.assign(global, { TextEncoder, TextDecoder });
