import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export function ScrollableScreen({children}) {
    return <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-around', marginVertical: 16}}>
        <View style={{maxWidth: 500}}>
            <ScrollView style={{maxWidth: 500}}>
                {children}
            </ScrollView>
        </View>
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
