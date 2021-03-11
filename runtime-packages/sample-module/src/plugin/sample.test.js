import { render, screen } from '@testing-library/react';
import App from 'ts-react-app/src/App';
import util from 'util';

import ExtUtils from '@plugjs/plugjs';

test('is proxy in external test', () => {
    const isProxy = util.types.isProxy(App);

    expect(isProxy).toBe(true);
})

test('plugin works', () => {
    ExtUtils.setPlugins([require('./sample.plugin')]);

    render(<App />);
    const pluginGreeting = screen.getByText(/Hello from plugin!/i);
    expect(pluginGreeting).toBeInTheDocument();
});
