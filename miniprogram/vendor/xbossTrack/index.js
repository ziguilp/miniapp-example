import Wrapper from './wrapper';
import {
    getBoundingClientRect,
    isClickTrackArea,
    getActivePage
} from './helper';
import report from './report';
const LifeCycleMethods = ["onLoad", "onShow", "onReady", "onHide", "onUnload", "onPullDownRefresh", "onReachBottom", "onShareAppMessage", "onShareTimeline", "onAddToFavorites", "onPageScroll", "onResize"];
class Tracker extends Wrapper {
    constructor({
        tracks,
        isUsingPlugin
    }, event = console.log) {
        super(isUsingPlugin);
        // 埋点配置信息
        this.tracks = tracks;
        this.event = event;
        //eventTImer
        this.eventTimer = {};
        // 自动给每个page增加elementTracker方法，用作元素埋点
        this.addPageMethodExtra(this.elementTracker());
        // 自动给page下预先定义的方法进行监听，用作方法执行埋点
        this.addPageMethodWrapper(this.methodTracker());
    }

    elementTracker() {
        // elementTracker变量名尽量不要修改，因为他和wxml下的名字是相对应的
        const elementTracker = (e) => {
            const tracks = this.findActivePageTracks('element');
            const {
                data
            } = getActivePage();
            tracks.forEach((track) => {
                getBoundingClientRect(track.element).then((res) => {
                    res.boundingClientRect.forEach((item) => {
                        const isHit = isClickTrackArea(e, item, res.scrollOffset);
                        track.dataset = item.dataset;
                        isHit && report(track, data);
                    });
                });
            });
        };
        return elementTracker;
    }

    methodTracker() {
        return (page, methodName, args) => {
            const {
                route,
                data
            } = getActivePage();
            let isLifeCycleMethod = LifeCycleMethods.indexOf(methodName) > -1;
            if (isLifeCycleMethod) { //生命周期函数
                //滚动事件处理，节流式
                if (methodName == 'onPageScroll') {
                    let mkey = `${route.replace("/","_")}_${methodName}`;
                    if (this.eventTimer[mkey]) {
                        clearTimeout(this.eventTimer[mkey])
                    }
                    this.eventTimer[mkey] = setTimeout(() => {
                        this.event(`${methodName}`, typeof args === 'object' ? {
                            ...args,
                            route
                        } : {
                            args,
                            route
                        })
                    }, 200) // 滚动事件埋点
                } else {
                    this.event(`${methodName}`, typeof args === 'object' ? {
                        ...args,
                        route
                    } : {
                        args,
                        route
                    }) // 全埋点
                }
            } else if (/.*__track$/.test(methodName)) {
                this.event(`${methodName.slice(0, methodName.length-7)}`, typeof args === 'object' ? {
                    ...args,
                    route
                } : {
                    args
                }) // 全埋点
            }

            const tracks = this.findActivePageTracks('method');
            tracks.forEach((track) => {
                if (track.method === methodName) {
                    report(track, data);
                }
            });
        };
    }

    /**
     * 获取当前页面的埋点配置
     * @param {String} type 返回的埋点配置，options: method/element
     * @returns {Object}
     */
    findActivePageTracks(type) {
        try {
            const {
                route
            } = getActivePage();
            const pageTrackConfig = this.tracks.find(item => item.path === route) || {};
            let tracks = {};
            if (type === 'method') {
                tracks = pageTrackConfig.methodTracks || [];
            } else if (type === 'element') {
                tracks = pageTrackConfig.elementTracks || [];
            }
            return tracks;
        } catch (e) {
            return {};
        }
    }
}

export default Tracker;