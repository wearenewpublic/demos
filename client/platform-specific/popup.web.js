import { StyleSheet, Text, View } from "react-native";
import { Clickable } from "../component/basics";
import React, { useCallback, useEffect, useState } from "react";
import ReactDOM from 'react-dom';

var global_active_popup_closer = null;

export function closeActivePopup() {
    if (global_active_popup_closer) {
        global_active_popup_closer();
    }
}

export function PopupSelector({value, items, onSelect}) {
    return (
        <View style={{marginHorizontal: 4, marginVertical: 4}}>
        <select value={value} onChange={e => onSelect(e.target.value)} style={{
            backgroundColor: 'white', padding: 8, borderColor: '#ddd', borderWidth: 1, 
            WebkitAppearance: 'none', borderRadius: 8, flex: 1}}>
                {items.map(item => 
                   <option key={item.key} value={item.key}>{item.label}</option>
                )}
        </select>
        </View>
    )
}


function DocumentLevelComponent({children}) {
    const [container, setContainer] = useState(null);

    useEffect(() => {
        const container = document.createElement('div');
        document.body.appendChild(container);
        setContainer(container);
        return () => {
            document.body.removeChild(container);
        }
    }, []);

    if (!container) return null;

    return ReactDOM.createPortal(
        children,
        container,
    );
}


export function Popup({popupContent, children}) {
    const s = PopupButtonStyle;
    const [shown, setShown] = useState(false);
    const [left, setLeft] = useState(null);
    const [right, setRight] = useState(null);
    const [top, setTop] = useState(null);
    const [bottom, setBottom] = useState(null);
    const [maxWidth, setMaxWidth] = useState(0);
    const popupRef = React.useRef(null);
    const clickTargetRef = React.useRef(null);  

    const closePopup = useCallback(() => {
        setShown(false);
    });

    useEffect(() => {
        if (shown) {
            global_active_popup_closer = closePopup;
        } else if (global_active_popup_closer == closePopup) {
            global_active_popup_closer = null;
        }
        return () => {
            if (global_active_popup_closer == closePopup) {
                global_active_popup_closer = null;
            }
        }
    }, [shown])

    function handleClickOutside(event) {
        if (popupRef.current && !popupRef.current.contains(event.target)) {
            cancelAnimationFrame(layoutPopup);
            setShown(false);
        }
    }

    function layoutPopup() {
        const rect = clickTargetRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const windowWidth = window.innerWidth;

        document.addEventListener('click', handleClickOutside);
        if (rect.top > windowHeight / 2) {
            setTop(null);
            setBottom(windowHeight - rect.top);
        } else {
            setTop(rect.bottom);
            setBottom(null);
        }
        if (rect.left > windowWidth / 2) {
            setRight(windowWidth - rect.right);
            setLeft(null);
        } else {
            setLeft(rect.left);
            setRight(null);
        }
        if (rect.left > windowWidth / 2) {
          setMaxWidth(rect.left - 16);
        } else {
          setMaxWidth(windowWidth - rect.right - 16);
        }
        requestAnimationFrame(layoutPopup);
    }

    const onClickShow = useCallback(() => {
        if (shown) {
            setShown(false);
            cancelAnimationFrame(layoutPopup);  
            return;
        };
        layoutPopup();
        // setUp(rect.top > windowHeight / 2);
        // setLeft(rect.left > windowWidth / 2);
        setShown(true);
    })

    useEffect(() => {
        return () => {
            document.removeEventListener('click', handleClickOutside);
            cancelAnimationFrame(layoutPopup);
        };
      }, []);

    return <View style={s.frame}>
        <View ref={clickTargetRef}>
            <Clickable onPress={onClickShow}>
                {children}
            </Clickable>
        </View> 
        {shown ? 
            <DocumentLevelComponent>
                <View ref={popupRef} 
                    style={[s.popup, {left, right, top, bottom, maxWidth}]}>
                    {shown ? popupContent() : null}
                </View>
            </DocumentLevelComponent>
        : null}
    </View>
}

const PopupButtonStyle = StyleSheet.create({
    frame: {
        position: 'relative'
    },
    popup: {
        position: 'absolute',        
        zIndex: 1000,
        borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10,
        shadowRadius: 4, shadowColor: '#555', shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.5, elevation: 1,
        backgroundColor: '#fff'

    },
    up: {
        bottom: 0
    },
    down: {
        top: 0
    },
    left: {
        right: 0
    },
    right: {
        left: 0
    }
})

export function PopupIcon({iconFamily, iconName, label=null}) {
    const s = PopupIconStyle;
    return <View style={s.frame}>
        {React.createElement(iconFamily, {name: iconName, size: 24, color: 'white'})}
    </View>
}

const PopupIconStyle = StyleSheet.create({
})