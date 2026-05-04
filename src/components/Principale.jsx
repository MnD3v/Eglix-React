import { useState } from "react";

function Principale(){
    const [age, setAge] = useState(0);
    return <>
    <p>{age}</p>
    <button onClick={()=>{
        setAge(age+1)
    }}>Modifier</button>
    </>;
}

export default Principale;