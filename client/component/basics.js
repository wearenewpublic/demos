import { Entypo } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Markdown from "react-native-markdown-display";
import { collapseDoubleSpaces, stripSingleLineBreaks } from "../util/util";
import { FaceImage, UserFace } from "./userface";
import { closeActivePopup } from "../platform-specific/popup.web";
import { setTitle } from "../platform-specific/url";
import { TranslatableLabel, translateLabel, useLanguage } from "./translation";
import { useObject } from "../util/datastore";


export function ScrollableScreen({children, grey, backgroundColor, maxWidth=500, pad=true}) {
    return <ScrollView style={{backgroundColor: grey ? '#EFF2F5' : backgroundColor ?? null}}>
        <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-around', paddingVertical: pad ? 16 :  null}}>
            <View style={{maxWidth: maxWidth, flexShrink: 1, flexGrow: 1, marginHorizontal: pad ? 8 : null}}>
                {children}
            </View>
        </View>
    </ScrollView>
}

export function WideScreen({children, pad}) {
    return <View style={{flex: 1, marginHorizontal: pad ? 16 : null}}>
        {children}
    </View>
}

export function Narrow({children, pad=true}) {
    return <View style={{flexDirection: 'row', justifyContent: 'space-around', paddingVertical: pad && 16}}>
        <View style={{maxWidth: 500, flexShrink: 1, flexGrow: 1, marginHorizontal: pad && 8}}>
            {children}
        </View>
    </View>
}


export function SectionBox({children}) {
    const s = SectionBoxStyle;
    return <View style={s.box}>
        {children}
    </View>
}

const SectionBoxStyle = StyleSheet.create({
    box: {
        // borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
        backgroundColor: '#f5f5f5',
    }
});


export function Card({children, onPress, fitted=false, vMargin=10, hMargin=10, pad=10}) {
    const s = CardStyle;

    return <MaybeClickable onPress={onPress} isClickable={onPress}
        style={[s.card, fitted ? {alignSelf: 'flex-start'} : null, {marginVertical: vMargin, marginHorizontal: hMargin}, {padding: pad}]} 
        hoverStyle={s.hover} >
            {children}
    </MaybeClickable>
}


const CardStyle = StyleSheet.create({
    card: {
        borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, margin: 10,
        shadowRadius: 1, shadowColor: '#555', shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.5, elevation: 1,
        backgroundColor: '#fff'
    },
    hover: {
        shadowRadius: 2, shadowColor: '#555', shadowOffset: {width: 0, height: 2}
    }
})

export function MaybeCard({children, isCard, onPress}) {
    if (isCard) {
        return <Card onPress={onPress}>{children}</Card>
    } else {
        return children;
    }
}

export function HoverRegion({onPress, children}) {
    const s = HoverRegionStyle;
    return <Clickable onPress={onPress} style={s.plainStyle} hoverStyle={s.hover}>
        {children}
    </Clickable>
}
const HoverRegionStyle = StyleSheet.create({
    plainStyle: {
        backgroundColor: '#fff',
        padding: 3,
        alignSelf: 'flex-start',
    },
    hover: {
        padding: 2, paddingRight: 8,
        shadowOpacity: 0.5, elevation: 1,
        borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
        shadowRadius: 1, shadowColor: '#555', shadowOffset: {width: 0, height: 1}
    }
})


export function Clickable({onPress, onHoverChange, children, style, hoverStyle=null}) {
    const [hover, setHover] = useState(false);
    function onPressInner() {
        if (onPress) {
            closeActivePopup();
            onPress();
        }
    }
    function onHover(hover) {
        setHover(hover);
        onHoverChange && onHoverChange(hover);
    }
    return <TouchableOpacity onPress={onPressInner} 
            onMouseEnter={() => onHover(true)}
            onMouseLeave={() => onHover(false)}
            style={hover ? [style, hoverStyle] : style} pointerEvents="box-none">
        {children}
    </TouchableOpacity>
}

export function MaybeClickable({onPress, children, style, hoverStyle, onHoverChange, isClickable}) {
    if (!isClickable) {
        return <View style={style}>{children}</View>
    } else {
        return <Clickable onPress={onPress} style={style} 
            hoverStyle={hoverStyle} 
            onHoverChange={onHoverChange}>
               {children}
        </Clickable>
    }
}

export function BigTitle({children, pad=true, width=null}) {
    return <Text style={{fontSize: 24, width, fontWeight: 'bold', marginBottom: pad ? 8 : 0}}>{children}</Text>
}

export function SmallTitle({children, hover, width=null}) {
    const s = SmallTitleStyle;
    return <Text style={[s.smallTitle, hover ? s.hover : null, width ? {width} : null]}>{children}</Text>
}
const SmallTitleStyle = StyleSheet.create({
    smallTitle: {
        fontSize: 16, fontWeight: 'bold'
    },
    hover: {
        color: '#000',
        textDecorationLine: 'underline'
    }
})

export function MiniTitle({children, hover, width=null}) {
    const s = MiniTitleStyle;
    return <Text style={[s.smallTitle, hover ? s.hover : null, width ? {width} : null]}>{children}</Text>
}
const MiniTitleStyle = StyleSheet.create({
    smallTitle: {
        fontSize: 14, fontWeight: 'bold'
    },
    hover: {
        color: '#000',
        textDecorationLine: 'underline'
    }
})



export function SmallTitleLabel({label, formatParams, fontSize = 16}) {
    return <TranslatableLabel style={{fontSize, fontWeight: 'bold', marginBottom: 2}} 
        label={label} formatParams={formatParams} />
}

export function SectionTitleLabel({label, formatParams}) {
    return <TranslatableLabel style={{fontSize: 15, fontWeight: 'bold', marginBottom: 8}} 
        label={label} formatParams={formatParams} />
}

export function BodyText({children}) {
    return <Text style={{fontSize: 15, color: '#444', maxWidth: 500}}>{children}</Text>
}

export function OneLineText({children}) {
    return <Text numberOfLines={1} style={{fontSize: 15, color: '#444', maxWidth: 500}}>{children}</Text>
}

const markdownStyles = {
    body: {
        fontSize: 15, lineHeight: 18, color: '#444'
    },
    heading1: {
        fontSize: 18, fontWeight: 'bold', marginBottom: 0, marginTop: 8
    },
    bullet_list: {
        marginVertical: 8
    }
}


export function MarkdownBodyText({text}) {
    return <View style={{maxWidth: 500}}>
        <Markdown style={markdownStyles}>
            {collapseDoubleSpaces(stripSingleLineBreaks(text ?? ''))}
        </Markdown>
    </View>
}

export function PreviewText({text, numberOfLines=2}) {
    const lineLessText = (text || '').replace(/\n/g, ' ').trim()
    return <Text numberOfLines={numberOfLines} style={{fontSize: 15, color: '#444', maxWidth: 500}}>{lineLessText}</Text>
}

function formatDate(date, language = 'english') {
    const currentDate = new Date();
    const inputDate = new Date(date);

    const diffInSeconds = Math.floor((currentDate - inputDate) / 1000);

    if (diffInSeconds < 60) {
        return translateLabel({label: 'Just now', language});
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return translateLabel({label: '{minutes}m ago', language, formatParams:{minutes}});
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return translateLabel({label: '{hours}h ago', language, formatParams:{hours}});
    } else if (diffInSeconds < 2592000) {
        const days = Math.floor(diffInSeconds / 86400);
        return translateLabel({label: '{days}d ago', language, formatParams:{days}});
    } else if (currentDate.getFullYear() == inputDate.getFullYear()) {
        const formattedDate = inputDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
        return formattedDate;
    } else {
        const formattedDate = inputDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
        return formattedDate;
    }
}
    

export function TimeText({time}) {
    const language = useLanguage();
    return <Text style={{fontSize: 12, color: '#999'}}>{formatDate(time, language)}</Text>
}

export function AuthorLine({author, time, oneLine=false}) {
    const language = useLanguage()
    if (oneLine) {
        return <HorizBox center>
            <FaceImage face={author.face} size={16}/>
            <View style={{marginLeft: 4, flexDirection: 'row'}}>
                <Text style={{fontSize: 12, fontWeight: 'bold'}}>{author.name}</Text>
                <Text style={{fontSize: 12, color: '#999'}}> - {formatDate(time)}</Text>
            </View>
        </HorizBox>
    } else {
        return <HorizBox center>
            <FaceImage face={author.face} size={24}/>
            <View style={{marginLeft: 6}}>
                <Text style={{fontSize: 12, fontWeight: 'bold'}}>{author.name}</Text>
                <Text style={{fontSize: 12, color: '#999'}}>{formatDate(time)}</Text>
            </View>
        </HorizBox>
    }
}

export function Separator({pad=16}) {
    return <View style={{borderBottomWidth: 1, borderColor: '#ddd', marginVertical: pad}}/>
}

export function Pad({size=8}) {
    return <View style={{height: size, width: size}}/>
}

export function HorizBox({children, center=false, spread=false, hideOverflow=true}) {
    return <View style={{
            flexDirection: 'row', 
            overflow: hideOverflow ? 'hidden' : null,
            alignItems: center ? 'center' : 'flex-start', 
            justifyContent: spread ? 'space-between' : 'flex-start'
        }}>
        {children}
    </View>
}

export function WrapBox({children}) {
    return <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>{children}</View>
}

export function Center({children, pad=0}) {
    return <View style={{alignSelf: 'center', alignItems: 'center', margin: pad}}>
        {children}
    </View>  
}

export function PadBox({children, horiz=8, vert=8}) {
    return <View style={{paddingHorizontal: horiz, paddingVertical: vert}}>{children}</View>
}

export function PrimaryButton({label, icon, onPress}) {
    const s = PrimaryButtonStyle;
    return <Clickable onPress={onPress} style={s.button} hoverStyle={s.hover}>
        {icon ? <View style={{marginRight: 12}}>{icon}</View> : null}
        <TranslatableLabel style={{color: 'white'}} label={label} />
    </Clickable>
}
const PrimaryButtonStyle = StyleSheet.create({
    button: {
        alignSelf: 'flex-start',
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8,
        backgroundColor: 'rgb(0, 132, 255)', borderRadius: 4
    },
    hover: {
        backgroundColor: 'hsl(209, 100%, 40%)'
    }
})

export function SecondaryButton({label, onPress}) {
    const s = SecondaryButtonStyle;
    return <Clickable onPress={onPress} 
        style={s.button} hoverStyle={s.hover}>
            <TranslatableLabel style={{color: '#666'}} label={label} />
    </Clickable>
}
const SecondaryButtonStyle = StyleSheet.create({
    button: {
        paddingHorizontal: 16, paddingVertical: 8, color: '#666'
    },
    hover: {
        backgroundColor: '#eee',
        borderRadius: 4
    }
})

export function StatusButtonlikeMessage({label}) {
    return <View style={{paddingHorizontal: 16, paddingVertical: 8, color: '#666', alignSelf: 'flex-start',
            borderColor: '#666', borderRadius: 4, borderWidth: 1}}>
        <TranslatableLabel style={{color: '#666'}} label={label} />
    </View>
}


export function MaybeEditableText({editable, value, action, placeholder, onChange}) {
    if (editable) {
        return <EditableText value={value} action={action} placeholder={placeholder} onChange={onChange}/>
    } else {
        return <BodyText>{value}</BodyText>
    }
}

export function AutoSizeTextInput({value, onChange, placeholder, style, hoverStyle=null, maxHeight = 400, emptyHeight = 0, ...props}) {
    const [height, setHeight] = useState(0);
    const [hover, setHover] = useState(false);

    useEffect(() => {
        if (value == '' && height > 0) {
            setHeight(emptyHeight);
        }
    }, [value])

    function onContentSizeChange(e) {
        const newHeight = e.nativeEvent.contentSize.height;
        if (newHeight > height) {
            setHeight(Math.min(newHeight, maxHeight));
        }
    }

    const styleHeight = Math.max(40, height);

    return <View style={{height: styleHeight}}>
        <TextInput value={value} onChangeText={onChange} placeholder={placeholder} 
            onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
            multiline={true} 
            style={[style, {height: styleHeight}, hover ? hoverStyle : null]} 
            onContentSizeChange={onContentSizeChange} {...props} />
    </View>
}


export function OneLineTextInput({value, onChange, placeholder, ...props}) {
    const s = OneLineTextInputStyle;
    const [hover, setHover] = useState(false);
    return <TextInput value={value} style={!hover ? s.textInput : [s.textInput, s.hover]}
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        placeholderTextColor='#999' onChangeText={onChange} placeholder={placeholder} />
}

const OneLineTextInputStyle = StyleSheet.create({
    textInput: {
        flexShrink: 0,
        maxWidth: 500,
        borderRadius: 8, 
        borderWidth: StyleSheet.hairlineWidth, 
        borderColor: '#ddd', padding: 8,
        fontSize: 15, lineHeight: 20,
    },
    hover: {
        borderColor: '#999'
    }
})


export function MultiLineTextInput({value, onChange, placeholder, ...props}) {
    const s = OneLineTextInputStyle;
    return <AutoSizeTextInput value={value} style={s.textInput} placeholderTextColor='#999' onChangeText={onChange} placeholder={placeholder} />
}

const MultiLineTextInputStyle = StyleSheet.create({
    textInput: {
        flex: 1,
        borderRadius: 8, 
        borderWidth: StyleSheet.hairlineWidth, 
        borderColor: '#ddd', padding: 8,
        marginHorizontal: 0,
        fontSize: 15, lineHeight: 20,
        height: 150,
        maxHeight: 600
    },
});


export function FormField({label, children}) {
    const s = FormFieldStyle;
    return <View style={s.outer}>
        <TranslatableLabel label={label} style={s.label}/>
        {children}
    </View>
}
const FormFieldStyle = StyleSheet.create({
    outer: {
        marginBottom: 8
    },
    label: {
        marginLeft: 8,
        fontWeight: 'bold',
        fontSize: 12,
        marginBottom: 2
    }
}) 



export function EditableText({value, label, action='Update', height=150, placeholder, onChange, onChangeEditState=()=>{}, multiline=true, flatTop=false, flatBottom=false}) {
    const s = EditableTextStyle;
    const [text, setText] = useState(null);
    return <View style={s.outer}>
        {label ? <TranslatableLabel style={s.label} label={label}/> : null}
        <AutoSizeTextInput style={[s.textInput, 
            flatTop ? {borderTopLeftRadius: 0, borderTopRightRadius: 0} : null,
            flatBottom ? {borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottomWidth: 0} : null
         ]} 
            hoverStyle={{borderColor: '#999'}}
            height={height}
            value={text ?? value ?? ''}
            placeholder={placeholder}
            placeholderTextColor='#999'
            multiline={multiline} 
            onChangeText={text => {setText(text); onChangeEditState(true)}} 
        />
        {text ? 
            <View style={s.actions}>
                <PrimaryButton onPress={() => {onChange(text); setText(null); onChangeEditState(false)}} label={action} />
                <SecondaryButton onPress={() => {setText(null); onChangeEditState(false)}} label='Cancel' />
            </View>
        : null}
    </View>
}

const EditableTextStyle = StyleSheet.create({
    outer: {
        maxWidth: 500
        // height: 150,
    },
    label: {
        marginLeft: 12,
        fontWeight: 'bold',
        fontSize: 12, 
        marginBottom: 2
    },
    textInput: {
        flexShrink: 0,
        maxWidth: 500,
        marginLeft: 4, marginRight: 4,
        borderRadius: 8, 
        borderWidth: StyleSheet.hairlineWidth, 
        borderColor: '#ddd', padding: 8,
        marginHorizontal: 8,
        fontSize: 15, lineHeight: 20,
        // height: 150,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        margin: 8,
    }
})


export function PillBox({children, big=false, color='#666'}) {
    const s = PillStyle;
    return <View style={[big ? s.bigBubble : s.bubble, {borderColor: color, paddingHorizontal: 8, paddingVertical: 4}]}>
        {children}
    </View>
}


export function Pill({label, text=null, color = '#666', big=false, showCross=false}) {
    const s = PillStyle
    return <View style={[big ? s.bigBubble : s.bubble, {borderColor: color}, showCross ? {paddingRight: 4} : null]}>
        {text ? 
            <Text style={[big ? s.bigText : s.text, {color}]}>{text}</Text>
        :
            <TranslatableLabel style={[big ? s.bigText : s.text, {color}]} label={label} />
        }
        {showCross ? 
            <Entypo name='cross' size={big ? 18 : 12} color={color} />
        : null}
    </View>
}
const PillStyle = StyleSheet.create({
    bubble: {
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 1,
        // marginRight: 8,
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start'
    },
    bigBubble: {
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 16,
        paddingRight: 4,
        paddingVertical: 2,
        // marginRight: 8,
        // marginBottom: 4,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        alignSelf: 'flex-start'
    },
    bigText: {
        fontSize: 16,
        marginLeft: 10,
        marginRight: 4
    },
    text: {
        fontSize: 11,
    }
})

export function ListItem({title, subtitle, onPress}) {
    const s = ListItemStyle;
    return <MaybeClickable onPress={onPress} isClickable={onPress} style={s.item} hoverStyle={s.hover}>
        <Text style={s.title}>{title}</Text>
        <Text style={s.subtitle}>{subtitle}</Text>
    </MaybeClickable>
}

const ListItemStyle = StyleSheet.create({
    item: {
        backgroundColor: '#f5f5f5',
        marginVertical: 4,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8
    },
    hover: {
        shadowRadius: 2, shadowColor: '#555', shadowOffset: {width: 0, height: 2}
    },
    title: {
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 2
    },
    subtitle: {
        fontSize: 12
    }
})

export function ScreenTitleText({title}) {
    setTitle(title);
    return <Text>{title}</Text>    
}

export function LoadingScreen() {
    const s = LoadingScreenStyle;
    return <View style={s.outer}><TranslatableLabel style={s.text} label='Loading...' /></View>
}

const LoadingScreenStyle = StyleSheet.create({
    outer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: '#666'
    }
});

export function PluralLabel({count, singular, plural}) {
    return <Text>{count} <TranslatableLabel label={count === 1 ? singular : plural}/></Text>
}

export function BackgroundBar({count, maxCount}) {
    const s = BarStyle;
    return <View style={s.frame}>
        <View style={[s.filled, {flex: count}]} />
        <View style={[s.empty, {flex: Math.max(maxCount, 4) - count}]} />
    </View>
}
const BarStyle = StyleSheet.create({
    frame: {
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
        flexDirection: 'row',
        // borderRadius: 10,
    },
    filled: {
        backgroundColor: '#77C7F6',
        borderRadius: 4,
    },
    empty: {
    }
});

export function UserFaceAndName({personaKey, extraLabel}) {
    const s = UserNameChipStyle;
    const persona = useObject('persona', personaKey);
    return <View style={s.authorBox}>
        <UserFace userId={personaKey} size={16} />
        <View style={s.authorRight}>
            <Text style={s.authorName}>{persona.name}</Text>            
            <TranslatableLabel style={s.extraLabel} label={extraLabel} />
        </View>
    </View>
}

const UserNameChipStyle = StyleSheet.create({  
    authorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    authorRight: {
        marginLeft: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },
    authorName: {
        fontSize: 13,
        fontWeight: 'bold',
    },      
    extraLabel: {
        fontSize: 13,
        marginLeft: 4,
        color: '#666',
    }
})

export function InfoBox({titleLabel, label, lines=[]}) {
    const s = InfoBoxStyle;
    return <View style={s.outer}>
        <View style={s.box}>
            <TranslatableLabel style={s.title} label={titleLabel} />
            {lines.map((line, idx) => 
                <TranslatableLabel key={idx} style={s.body} label={line} />
            )}
            {label && <TranslatableLabel style={s.body} label={label} />}
        </View>       
    </View>
}
const InfoBoxStyle = StyleSheet.create({
    outer: {
        flexDirection: 'row',
        justifyContent: 'center',  
    },
    box: {
        flexGrow: 0,
        flexShrink: 1,
        backgroundColor: 'white',
        borderRadius: 16,
        borderColor: '#ddd',
        borderWidth: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        alignItems: 'center'
    },
    title: {
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 2,
        textAlign: 'center'
    },
    body: {
        fontSize: 14,
        marginTop: 2,
        color: '#666',
        textAlign: 'center',
    }
})

export function ClickableText({children, style, onPress}) {
    const s = ClickableTextStyle;
    const [hover, setHover] = useState(false);
    return <Clickable onHoverChange={setHover} onPress={onPress}><Text style={hover ? [style, s.hoverText] : style}>{children}</Text></Clickable>
}

const ClickableTextStyle = StyleSheet.create({
    hoverText: {
        color: '#000',
        textDecorationLine: 'underline'
    },
})

