const fetch = require('node-fetch');
const logger = require('./logger');
const { getSystemConfig } = require('./get-configuration-file');

const GA_TRACKING_ID = process.env.GA_TRACKING_ID || 'UA-127741417-8';
const UNKNOWN = 'unknown';

class Analytics {
    constructor() {
        this.isGaDisabled = this.getIsGaDisabled();
        this.gaTrackingId = GA_TRACKING_ID;
        this.clientIdentifier = UNKNOWN;
        this.currentUrl = UNKNOWN;
        this.lang = UNKNOWN;

        this.setClientIdentifier(Date.now());
    }

    setLang(lang) {
        this.lang = lang;
    }

    setCurrentUrl(currentUrl) {
        this.currentUrl = currentUrl;
    }

    setClientIdentifier(id) {
        this.clientIdentifier = id;
    }

    setGaTrackingId(id) {
        this.gaTrackingId = id;
    }

    getIsGaDisabled = async () => {
        const { analytics = true } = await getSystemConfig();

        return !analytics;
    };

    async _collect(data) {
        if (this.isGaDisabled) {
            // skip GA
            return;
        }
        const rawBody = {
            ...data,
            v: '1',
            tid: this.gaTrackingId,
            cid: this.clientIdentifier
        };

        if (this.lang !== UNKNOWN) {
            // get system language here
            rawBody.ul = this.lang;
        }

        if (this.currentUrl !== UNKNOWN) {
            const {
                hostname,
                pathname
            } = new URL(this.currentUrl);

            rawBody.dp = pathname;
            rawBody.dh = hostname;
            rawBody.dl = this.currentUrl;
        }

        const params = new URLSearchParams(rawBody).toString();

        try {
            if (!process.env.GA_DEBUG) {
                await fetch(
                    `https://www.google-analytics.com/collect?${ params }`,
                    { headers: { 'User-Agent': 'Google-Cloud-Functions' } }
                );

                return;
            }

            const res = await fetch(
                `https://www.google-analytics.com/debug/collect?${ params }`,
                { headers: { 'User-Agent': 'Google-Cloud-Functions' } }
            );
            const jsonResponse = await res.json();

            logger.log(rawBody, jsonResponse);
            logger.log(jsonResponse.hitParsingResult[0].parserMessage);

        // eslint-disable-next-line no-empty
        } catch (e) {

        }
    }

    trackError(error, isFatal = true) {
        return this._collect({
            t: 'exception',
            exd: typeof error === 'string' ? error : error.message,
            exf: isFatal
        });
    }

    trackTiming(label, time, category = UNKNOWN) {
        return this._collect({
            t: 'timing',
            utc: category,
            utv: label,
            utl: this.currentUrl,
            utt: Math.round(time)
        });
    }

    trackPageView() {
        return this._collect({
            t: 'pageview'
        });
    }

    trackEvent(action, label, value, category = UNKNOWN) {
        return this._collect({
            t: 'event',
            ec: category,
            ea: action,
            el: label,
            ev: value
        });
    }

    printAboutAnalytics() {
        if (!this.gaDisabled) {
            logger.log('We collect analytics data to make our products more stable and reliable!');
            logger.log('If you want to know more go here https://docs.scandipwa.com/about/data-analytics');
            logger.logN();
        }
    }
}

module.exports = new Analytics();
