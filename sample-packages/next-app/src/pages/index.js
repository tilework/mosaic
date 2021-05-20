import getData from '../util/get-data';

console.log({ works: process.env.IS_WORKING });

function SamplePage() {
    return (
        <div>
            <img src="/picture.jpeg" alt="picture" />
            <h1>Homepage</h1>
            <p>Welcome to the webpage!</p>
            <p>Data: {getData()}</p>
        </div>
    );
}

export default SamplePage;