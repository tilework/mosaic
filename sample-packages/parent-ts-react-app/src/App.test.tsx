import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/This is written in the parent theme in TS/i);
  expect(linkElement).toBeInTheDocument();
});
