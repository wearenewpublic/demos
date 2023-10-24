import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { colorAccent, colorAccentHover, colorBlack, colorBlackHover, colorDisabledBackground, colorDisabledText, colorGreyBorder, colorGreyHover, colorTextBlue, colorWhite } from "./color";
import { UtilityText } from "./text";
import { TranslatableText } from "../component/translation";
import { Pad } from "../component/basics";
import { HoverView } from "./basics";
import { IconChevronDown, IconChevronUp } from "./icon";
import { FacePile } from "./people";

export function CTAButton({label, type, icon, disabled, onPress}) {
    const s = CTAButtonStyle;

    const styleMap = {
        primary: {normal: s.primary, hover: s.primaryHover, pressed: s.primaryHover},
        secondary: {normal: s.secondary, hover: s.secondaryHover, pressed: s.secondaryHover},
        accent: {normal: s.accent, hover: s.accentHover, pressed: s.accentHover},
        disabled: {normal: s.disabled, hover: s.disabled, pressed: s.disabled}
    }
    const {normal, hover, pressed} = styleMap[disabled ? 'disabled' : type];
    const textColor = disabled ? colorDisabledText : type == 'secondary' ? colorBlack : colorWhite;
    
    return <HoverView 
            style={[s.button, normal]} hoverStyle={[s.hover, hover]} 
            pressedStyle={pressed} onPress={onPress} >
        <UtilityText type='large' label={label} color={textColor} />
    </HoverView>
}

const CTAButtonStyle = StyleSheet.create({
    hover: {
    },
    primary: {
        backgroundColor: colorBlack,
        borderColor: colorBlack,
    },
    primaryHover: {
        backgroundColor: colorBlackHover,
        borderColor: colorBlackHover,
    },
    secondary: {
        borderColor: colorGreyBorder,
    },
    secondaryHover: {
        backgroundColor: colorGreyHover,
        borderColor: colorGreyBorder
    },
    accent: {
        backgroundColor: colorAccent,
        borderColor: colorAccentHover
    },
    accentHover: {
        backgroundColor: colorAccentHover,
        borderColor: colorAccentHover
    },
    disabled: {
        backgroundColor: colorDisabledBackground,
        borderWidth: 1,
        borderColor: colorGreyBorder,
        color: colorDisabledText
    },
    button: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        alignSelf: 'flex-start',
        borderWidth: 1
    }
})


export function IconButton({label, icon=null, onPress}) {
    const s = IconReplyStyle;
    return <HoverView style={s.button} hoverStyle={s.hover} onPress={onPress}>
        {React.createElement(icon)} 
        <Pad size={8} />
        <UtilityText label={label} />
    </HoverView>
}
const IconReplyStyle = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        alignSelf: 'flex-start',
        borderRadius: 100,
        backgroundColor: colorGreyHover
    },
    hover: {
        backgroundColor: colorGreyBorder,
    },
});

export function SubtleButton({label, text, formatParams, icon=null, onPress}) {
    const s = SubtleButtonStyle;
    return <HoverView style={s.button} hoverStyle={s.hover} onPress={onPress}>
        {React.createElement(icon)}
        <Pad size={4} />
        <UtilityText label={label} text={text} formatParams={formatParams} type='tiny' />
    </HoverView>
}
const SubtleButtonStyle = StyleSheet.create({
    button: {
        flexDirection: 'row',
    },
    hover: {
        backgroundColor: colorGreyHover,
    }
});


export function ExpanderButton({userList, label, text, type='tiny', formatParams, setExpanded=()=>{}}) {
    const s = ExpanderButtonStyle;
    const [hover, setHover] = useState(false);
    const [localExpanded, setLocalExpanded] = useState(false);
    function onPress() {
        console.log('onPress', localExpanded);
        setLocalExpanded(!localExpanded);
        setExpanded(!localExpanded);
    }
    return <HoverView style={s.button} setHover={setHover} onPress={onPress}>        
        {userList && <FacePile type={type} userIdList={userList} />}
        {userList && <Pad size={4.5} />}
        <UtilityText label={label} text={text} formatParams={formatParams} type={type} color={colorTextBlue} underline={hover} />
        <Pad size={8} />
        {localExpanded ? <IconChevronUp /> : <IconChevronDown />}
    </HoverView>

}
const ExpanderButtonStyle = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
    }
})