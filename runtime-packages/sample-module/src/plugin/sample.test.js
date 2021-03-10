import { render, screen } from '@testing-library/react';
import App from 'react-app/src/App';

import ExtUtils from '@plugjs/plugjs';

test('plugin works', () => {
    ExtUtils.setPlugins([require('./sample.plugin').default]);

    render(<App />);
    const pluginGreeting = screen.getByText(/Hello from plugin!/i);
    expect(pluginGreeting).toBeInTheDocument();
});
