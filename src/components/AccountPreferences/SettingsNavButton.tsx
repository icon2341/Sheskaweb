import styles from './SettingsNavButton.module.scss';


/**
 * SettingsNavButton is a component that is used to display a navigation button in the settings pane.
 * @param props - the props of the component contains the title of the button, the icon of the button, the active state of the button and a function to set the current setting pane
 * @constructor - the constructor of the component
 */
export function SettingsNavButton(props: {title: string, icon: any, active: boolean, setCurrentSettingPane: any}) {
    const color = props.active ? 'white' : 'gray';
    const size = 28;
    const fontWeight = props.active ? 'bold' : 400;

    return (
        <div className={`${styles.buttonContainer} ${props.active ? styles.buttonContainerActive : ''}`}
            onClick={() => props.setCurrentSettingPane(props.title)}>
            <props.icon color={color} className={styles.navIcon} size={size}/>
            <h3 className={styles.navText} style={{color: color, fontWeight: fontWeight}}>{props.title}</h3>
        </div>
    )
}

export default SettingsNavButton;