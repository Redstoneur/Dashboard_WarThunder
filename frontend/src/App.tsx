import './style/App.css'
import Gyroscope from "./componant/Gyroscope.tsx";
import Compass from "./componant/Compass";
import Altitude from "./componant/Altitude";
import Speed from "./componant/Speed";
import Map from "./componant/Map";

function App() {

    return (
        <>
            <h1>Dashboard WarThunder</h1>
            <div className="widgets-row">
                <Gyroscope/>
                <Compass/>
                <Altitude/>
                <Speed/>
                <Map/>
            </div>
        </>
    )
}

export default App
