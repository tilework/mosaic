import { render, screen } from '@testing-library/react';
import App from './App';
import util from 'util';

test('is proxy in local test', () => {
  const isProxy = util.types.isProxy(App);

  expect(isProxy).toBe(true);
})

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
