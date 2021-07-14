import { render, queryByAttribute } from '@testing-library/react';
import App from '../../../../src/App';

test('App has red border', () => {
    Mosaic.setPlugins([require('./Other.plugin')]);

    const dom = render(<App />);
    const border = queryByAttribute('class', dom.container, 'RedBorder');

    expect(border).toBeInTheDocument();
});
