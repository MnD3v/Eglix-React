import './Boutton_Jaune.css';
function BouttonJaune({label, onclick}){
    return <button className="boutton" onClick={onclick} >
        <p>{label}</p>
    </button>;
}

export default BouttonJaune;