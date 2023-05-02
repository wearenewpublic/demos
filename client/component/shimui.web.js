import { View } from "react-native";

export function PopupSelector({value, items, onSelect}) {
    return (
        <View style={{marginHorizontal: 16, marginVertical: 4}}>
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

