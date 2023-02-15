export default {
    'ReactApp/App': {
        'member-function': {
            render: (a,c) => (<>
                (App) Native namespace plugin(
                <br />
                {c(...a)}
                <br />
                )
            </>)
        }
    },
    'Hello/Wo': {
        'function': (a, c) => {
            console.log('before');
            c(...a);
            console.log('after');
        }
    }
};