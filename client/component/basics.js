import { Entypo } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";


export function ScrollableScreen({children, maxWidth=500}) {
    return <ScrollView>
        <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 16}}>
            <View style={{maxWidth: maxWidth, flexShrink: 1, marginHorizontal: 8}}>
                {children}
            </View>
        </View>
    </ScrollView>
}

export function WideScreen({children, pad}) {
    return <View style={{flex: 1, margin: pad ? 16 : null}}>
        {children}
    </View>
}

export function Narrow({children}) {
    return <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 16}}>
        <View style={{maxWidth: 500, flexShrink: 1, flexGrow: 1, marginHorizontal: 8}}>
            {children}
        </View>
    </View>
}


export function Card({children, fitted=false}) {
    const s = CardStyle;
    return <View style={[s.card, fitted ? {alignSelf: 'flex-start'} : null]}>
        {children}
    </View>
}

const CardStyle = StyleSheet.create({
    card: {
        borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, margin: 10,
        shadowRadius: 1, shadowColor: '#555', shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.5, elevation: 1,
        backgroundColor: '#fff'
    }
})

export function Clickable({onPress, children, style}) {
    return <TouchableOpacity onPress={onPress} style={style} pointerEvents="box-none">
        {children}
    </TouchableOpacity>
}

export function BigTitle({children}) {
    return <Text style={{fontSize: 24, fontWeight: 'bold', marginBottom: 8}}>{children}</Text>
}

export function SmallTitle({children}) {
    return <Text style={{fontSize: 16, fontWeight: 'bold', marginBottom: 2}}>{children}</Text>
}

export function SectionTitle({children}) {
    return <Text style={{fontSize: 15, fontWeight: 'bold', marginBottom: 8}}>{children}</Text>
}

export function BodyText({children}) {
    return <Text style={{fontSize: 15, color: '#444', maxWidth: 500}}>{children}</Text>
}

function formatDate(date) {
    const currentDate = new Date();
    const inputDate = new Date(date);

    const diffInSeconds = Math.floor((currentDate - inputDate) / 1000);

    if (diffInSeconds < 60) {
        return 'Just now';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours}h ago`;
    } else if (diffInSeconds < 2592000) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days}d ago`;
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
    return <Text style={{fontSize: 12, color: '#999'}}>{formatDate(time)}</Text>
}

export function Separator() {
    return <View style={{borderBottomWidth: 1, borderColor: '#ddd', marginVertical: 16}}/>
}

export function Pad({size=8}) {
    return <View style={{height: size, width: size}}/>
}

export function HorizBox({children}) {
    return <View style={{flexDirection: 'row'}}>{children}</View>
}

export function WrapBox({children}) {
    return <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>{children}</View>
}

export function Center({children, pad=0}) {
    return <View style={{flexDirection: 'row', justifyContent: 'center', margin: pad}}>{children}</View>  
}

export function PrimaryButton({children, icon, onPress}) {
    return <Clickable onPress={onPress} style={{alignSelf: 'flex-start'}}>
        <View style={{flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: 'rgb(0, 132, 255)', borderRadius: 4}}>
            {icon ? <View style={{marginRight: 12}}>{icon}</View> : null}
            <Text style={{color: 'white'}}>{children}</Text>
        </View>
    </Clickable>
}

export function SecondaryButton({children, onPress}) {
    return <Clickable onPress={onPress}>
        <View style={{paddingHorizontal: 16, paddingVertical: 8, color: '#666'}}>
            <Text style={{color: '#666'}}>{children}</Text>
        </View>
    </Clickable>
}


export function MaybeEditableText({editable, value, action, placeholder, onChange}) {
    if (editable) {
        return <EditableText value={value} action={action} placeholder={placeholder} onChange={onChange}/>
    } else {
        return <BodyText>{value}</BodyText>
    }
}

export function EditableText({value, label, action='Update', height=150, placeholder, onChange, multiline=true, flatTop=false, flatBottom=false}) {
    const s = EditableTextStyle;
    const [text, setText] = useState(null);
    return <View style={s.outer}>
        {label ? <Text style={s.label}>{label}</Text> : null}
        <TextInput style={[s.textInput, {height: multiline ? height : 40}, 
            flatTop ? {borderTopLeftRadius: 0, borderTopRightRadius: 0} : null,
            flatBottom ? {borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottomWidth: 0} : null
         ]} 
            value={text ?? value}
            placeholder={placeholder}
            placeholderTextColor='#999'
            multiline={multiline} 
            onChangeText={setText} 
        />
        {text ? 
            <View style={s.actions}>
                <PrimaryButton onPress={() => {onChange(text); setText(null)}}>{action}</PrimaryButton>
                <SecondaryButton onPress={() => setText(null)}>Cancel</SecondaryButton>
            </View>
        : null}
    </View>
}

const EditableTextStyle = StyleSheet.create({
    outer: {
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


export function Pill({label, color = '#666', big=false, showCross=false}) {
    const s = PillStyle
    return <View style={[big ? s.bigBubble : s.bubble, {borderColor: color}, showCross ? {paddingRight: 4} : null]}>
        <Text style={[big ? s.bigText : s.text, {color}]}>{label}</Text>
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
        paddingVertical: 2,
        marginRight: 8,
        flexDirection: 'row',
        alignItems: 'center'
    },
    bigBubble: {
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 16,
        paddingRight: 4,
        paddingVertical: 2,
        marginRight: 8,
        marginBottom: 4,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white'
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

