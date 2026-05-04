import { useState } from "react";
import BouttonJaune from "./Boutton_Jaune";

function Profil() {

    const [isConnected, setConnection] = useState(true);
    return <>

    {
        isConnected?(<p>L'utilisateur est connecté</p>):(<p>L'utilisateur n'est pas connecté</p>)
    }

           
        <BouttonJaune label={"Deconnecter"} onclick={() => {
            setConnection(!isConnected);
            console.log(isConnected);
        }}></BouttonJaune>
    </>;
}

export default Profil;