import getData from '../util/get-data';

function SamplePage() {
    return (
        <div>
            <h1>Homepage</h1>
            <p>Welcome to the webpage!</p>
            <p>Data: {getData()}</p>
        </div>
    );
}

export default SamplePage;