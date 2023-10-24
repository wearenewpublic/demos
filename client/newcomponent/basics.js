import { useState } from "react";
import { View } from "react-native";
import { Clickable } from "../component/basics";

export function HoverView({style, hoverStyle, pressedStyle, children, onPress, setHover=()=>{}}) {
    const [localHover, setLocalHover] = useState(false);
    return <Clickable
        style={[style, localHover ? hoverStyle : null, {cursor: 'pointer'}]}
        onHoverChange={hover => {setLocalHover(hover); setHover(hover)}}
        onPress={onPress}>
            {children}
    </Clickable>
}

