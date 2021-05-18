import { PureComponent } from "react";

import './Page.global.css';
import styles from './Page.style.module.scss';

export class Page extends PureComponent {
    render() {
        return <p className={styles.Paragraph}>I am a page</p>;
    }
}

export default Page;

