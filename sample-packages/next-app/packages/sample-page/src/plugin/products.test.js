import ExtUtils from '@tilework/mosaic';
import { render, screen } from '@testing-library/react';

test('Is successfully plugged into the application', () => {
  ExtUtils.setPlugins([require('./products.plugin')]);

  const SamplePage = getGenerated('Pages/sample/Page');
  render(<SamplePage />);

  const linkElement = screen.getByText(/It works!/i);
  expect(linkElement).toBeInTheDocument();
});
