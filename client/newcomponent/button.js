import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { colorAccent, colorAccentHover, colorBlack, colorBlackHover, colorDisabledBackground, colorDisabledText, colorGreyBorder, colorGreyHover, colorGreyPopupBackground, colorRed, colorTextBlue, colorWhite } from "./color";
import { UtilityText } from "./text";
import { TranslatableText } from "../component/translation";
import { Clickable, Pad } from "../component/basics";
import { HoverView } from "./basics";
import { IconChevronDown, IconChevronDownBlack, IconChevronUp } from "./icon";
import { FacePile } from "./people";
import { Popup } from "../platform-specific/popup";

export function CTAButton({label, type='primary', icon, disabled, onPress}) {
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

export function Tag({label, text, type='emphasized', formatParams, color=null, onPress}) {
    const s = TagStyle;
    return <View style={[s.button, type == 'emphasized' && s.emphasized, 
                color && {borderColor: color, backgroundColor: color}]} 
            hoverStyle={s.hover} onPress={onPress}>
        <UtilityText label={label} text={text} formatParams={formatParams} type='tiny' />
    </View>
}
const TagStyle = StyleSheet.create({
    button: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        borderRadius: 4,
        borderColor: colorGreyBorder
    },
    emphasized: {
        borderRadius: 100,
    },
})

export function ReactionButton({label, count}){
    const s = ReactionButtonStyle;
    return <HoverView style={s.button} hoverStyle={s.hover}>
        <UtilityText label={label} type='tiny' bold />
        <Pad size={8} />
        <UtilityText text={count} type='tiny' color={colorRed} />
    </HoverView>
}
const ReactionButtonStyle = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colorGreyBorder,
    },
    hover: {
        backgroundColor: colorGreyHover,
    }
})

export function DropDownSelector({label, options, value, onChange=()=>{}}) {
    const s = DropDownSelectorStyle;
    const selectedOption = options.find(o => o.key == value) || options[0];
    function popup() {
        return <View >
            {options.map((o, i) => <View key={i}>
                {i != 0 && <Pad size={20} />}
                <Clickable onPress={() => onChange(o.key)}>
                    <UtilityText label={o.label} type='tiny' />
                </Clickable>
            </View>)}
        </View>
    }
    return <Popup popupContent={popup} popupStyle={s.popup}>
        <View style={s.button}>
            <UtilityText label={label} type='tiny' />
            <UtilityText text=': ' type='tiny' />
            <UtilityText label={selectedOption.label} type='tiny' />
            <Pad size={8} />
            <IconChevronDownBlack />
        </View>        
    </Popup>
}

const DropDownSelectorStyle = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignSelf: 'flex-start',
    },
    popup: {
        backgroundColor: colorGreyPopupBackground,
        borderRadius: 8,
        padding: 12
    }
})