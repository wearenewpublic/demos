import { StyleSheet, Text } from "react-native";
import { useCollection, useDatastore } from "../util/datastore";
import { HorizBox, Pad, ScrollableScreen, SmallTitleLabel } from "./basics";
import { UserFace } from "./userface";
import { PopupSelector } from "../platform-specific/popup";

export function MembersScreen() {
    const personas = useCollection('persona', {sortBy: 'name'});
    const members = personas.filter(p => p.member && p.key);
    const guests = personas.filter(p => !p.member && p.key); 
    return <ScrollableScreen>
        <SmallTitleLabel label='Members' />
        <Pad/>
        {members.map(persona => <PersonaSummary key={persona.key} persona={persona} />)}
        <Pad size={32} />
        <SmallTitleLabel label='Guests' />
        <Pad/>
        {guests.map(persona => <PersonaSummary key={persona.key} persona={persona} />)}

    </ScrollableScreen>
}

function PersonaSummary({persona}) {
    const s = PersonaSummaryStyle;
    const datastore = useDatastore();
    const memberOptions = [
        {key: 'member', label: 'Member'},
        {key: 'guest', label: 'Guest'},
    ]

    function onSelect(value) {
        datastore.updateObject('persona', persona.key, {member: value == 'member'});
    }

    return <HorizBox center>
        <Pad/>
        <UserFace userId={persona.key} />
        <Text style={s.name}>{persona.name}</Text>
        <Pad/>
        <PopupSelector items={memberOptions} value={persona.member ? 'member' : 'guest'} onSelect={onSelect} />
    </HorizBox>
}

const PersonaSummaryStyle = StyleSheet.create({
    name: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333'
    }
})
