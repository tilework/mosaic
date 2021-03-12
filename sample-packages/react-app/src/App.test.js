import { render, screen } from '@testing-library/react';
import util from 'util';
import App from './App';

test('is proxy', () => {
  const isProxy = util.types.isProxy(App);

  expect(isProxy).toBe(true);
})

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/This is written in JS/i);
  expect(linkElement).toBeInTheDocument();
});
