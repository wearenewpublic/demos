import { ScrollView, StyleSheet, Text, View } from "react-native"
import { BigTitle, BodyText, Card, Center, Clickable, Narrow, Pill, PreviewText, ScrollableScreen, Separator, SmallTitleLabel, TimeText } from "../component/basics"
import { prototypes } from "../prototype"
import { Entypo } from "@expo/vector-icons";
import React, { useState } from 'react'
import { NewPublicBodySection, NewPublicName, NewPublicTitle, NewPublicTitleBanner, colorNewPublicBackground } from "../component/newpublic";
import { WebLink } from "../platform-specific/url";
import { makePrototypeUrl } from "../util/navigate";

export function PrototypeListScreen() {
    const s = PrototypeListScreenStyle;
    const sortedPrototypes = prototypes.sort((a, b) => new Date(b.date).valueOf() -  new Date(a.date).valueOf());

    return (
        <ScrollView>
            <NewPublicTitleBanner>
                <NewPublicName>New_ Public</NewPublicName>
                <NewPublicTitle>Prototype Garden</NewPublicTitle>
            </NewPublicTitleBanner>
            <NewPublicBodySection>
                <Narrow>
                    {sortedPrototypes.map(prototype => 
                        <WebLink key={prototype.name} url={makePrototypeUrl(prototype.key)}>
                            <Card>
                                <View style={s.authorLine}>
                                    <SmallTitleLabel label={prototype.name}/>
                                    <TimeText time={prototype.date} />
                                </View>
                                <PreviewText text={prototype.description} />
                            </Card>
                        </WebLink>
                    )}
                </Narrow>
            </NewPublicBodySection>
        </ScrollView>
    )
}

const PrototypeListScreenStyle = StyleSheet.create({
    authorLine: {
        flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4
    },
    extraLine: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8
    }
});
