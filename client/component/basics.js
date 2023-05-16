import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export function ScrollableScreen({children}) {
    return <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-around', marginVertical: 16}}>
        <View style={{maxWidth: 500, flexShrink: 1, marginHorizontal: 8}}>
            <ScrollView style={{maxWidth: 500}}>
                {children}
            </ScrollView>
        </View>
    </View>
}

export function WideScreen({children, pad}) {
    return <View style={{flex: 1, margin: pad ? 16 : null}}>
        {children}
    </View>
}


export function Card({children}) {
    return <View style={{borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, margin: 10}}>
        {children}
    </View>
}

export function Clickable({onPress, children}) {
    return <TouchableOpacity onPress={onPress}>
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
    return <Text style={{fontSize: 15, color: '#444'}}>{children}</Text>
}

export function Separator() {
    return <View style={{borderBottomWidth: 1, borderColor: '#ddd', marginVertical: 16}}/>
}

export function Pad({size}) {
    return <View style={{height: size, width: size}}/>
}

export function PrimaryButton({children, onPress}) {
    return <Clickable onPress={onPress}>
        <View style={{paddingHorizontal: 16, paddingVertical: 8, backgroundColor: 'rgb(0, 132, 255)', borderRadius: 4}}>
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

export function EditableText({value, action='Update', placeholder, onChange}) {
    const s = EditableTextStyle;
    const [text, setText] = useState(null);
    return <View style={s.outer}>
        <TextInput style={s.textInput} 
            value={text ?? value}
            placeholder={placeholder}
            placeholderTextColor='#999'
            multiline={true} 
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
    textInput: {
        flexShrink: 0,
        borderRadius: 8, 
        borderWidth: StyleSheet.hairlineWidth, 
        borderColor: '#ddd', padding: 8,
        marginHorizontal: 8,
        fontSize: 15, lineHeight: 20,
        height: 150,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        margin: 8,
    }
})
