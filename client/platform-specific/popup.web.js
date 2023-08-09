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
        <View style={{marginHorizontal: 0, marginVertical: 0}}>
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

var global_clickTargetRef = null;
var global_popupRef = null;

function global_layoutPopup() {
    if (!global_clickTargetRef || !global_popupRef) return;
    if (!global_popupRef.current) {
        requestAnimationFrame(global_layoutPopup);
        return;
    }

    const node  = global_popupRef.current;
    const rect = global_clickTargetRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    if (rect.top > windowHeight / 2) {
        node.style.top = null;
        node.style.bottom = (windowHeight - rect.top) + 'px';       
    } else {
        node.style.top = rect.bottom + 'px';
        node.style.bottom = null;
    }
    if (rect.left > windowWidth / 2) {
        node.style.right = (windowWidth - rect.right) + 'px';
        node.style.left = null;
    } else {
        node.style.left = rect.left + 'px';
        node.style.right = null;
    }
    if (rect.left > windowWidth / 2) {
        node.style.maxWidth = (rect.left - 16) + 'px';
    } else {
        node.style.maxWidth = (windowWidth - rect.right - 16) + 'px';
    }
    requestAnimationFrame(global_layoutPopup);
}


export function Popup({popupContent, children}) {
    const s = PopupButtonStyle;
    const [shown, setShown] = useState(false);
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
            global_clickTargetRef = null;
            global_popupRef = null;
            setShown(false);
        }
    }

    const onClickShow = useCallback(() => {
        setShown(!shown);
    })

    useEffect(() => {
        if (shown) {
            global_clickTargetRef = clickTargetRef;
            global_popupRef = popupRef;
            global_layoutPopup();
        } else {
            global_clickTargetRef = null;
            global_popupRef = null;   
        }
    }, [shown]);

    useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
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
                <View ref={popupRef} style = {s.popup} >
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