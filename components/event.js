import styles from '../styles/Event.module.css'

function Event(props) {
    return (
        <div className={styles.event}>
            {Object.keys(props).map(key => key && props[key] && (<p key={key}>
                <span className={styles.key}>{key}: </span>
                <span className={styles.shadowed}>{props[key].toString()}</span>
            </p>))}
        </div>
    )
}

export default Event