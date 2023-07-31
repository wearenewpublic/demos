import { StyleSheet, TextInput } from "react-native";
import { Card, FormField, HorizBox, Narrow, OneLineTextInput, Pad, PadBox, PrimaryButton, SecondaryButton, SectionTitleLabel } from "../component/basics";
import { QuietSystemMessage } from "../component/message";
import { firebaseNewKey, firebaseWriteAsync, useFirebaseUser } from "../util/firebase";
import { useState } from "react";
import { languageEnglish, languageFrench, languageGerman, useTranslation } from "../component/translation";
import { PopupSelector } from "../platform-specific/popup";
import { goBack, gotoLogin, replaceInstance } from "../util/navigate";
import { generateRandomKey } from "../util/util";
import { replaceUrl } from "./url";

const nameParam = {key: 'name', name: 'Name', type: 'shorttext', placeholder: 'What is this instance called?'};
const languageParam = {key: 'language', name: 'Language', type: 'select', options: [
    {key: languageEnglish, label: 'English'},
    {key: languageFrench, label: 'French'},
    {key: languageGerman, label: 'German'}
]}


export function NewLiveInstanceScreen({prototype}) {
    const s = NewLiveInstanceScreenStyle;
    const newInstanceParams = prototype.newInstanceParams || [];
    const firebaseUser = useFirebaseUser();
    const [instanceGlobals, setInstanceGlobals] = useState({});

    function onCancel() {
        goBack();
    }

    function onCreate() {
        console.log('Creating instance', instanceGlobals);
        const key = generateRandomKey(20);
        const createTime = Date.now();
        const expandedGlobals = {
            ...instanceGlobals, admin: firebaseUser.uid, createTime
        }
        const userData = {
            name: expandedGlobals.name, createTime
        }
        firebaseWriteAsync(['prototype', prototype.key, 'instance', key, 'global'], expandedGlobals);
        firebaseWriteAsync(['prototype', prototype.key, 'userInstance', firebaseUser.uid, key], userData);
        replaceInstance({prototypeKey: prototype.key, instanceKey: key});
    }

    if (!firebaseUser) {
        return <PadBox><PrimaryButton label='Log in to create a live instance' onPress={gotoLogin} /></PadBox>
    } 

    return <Narrow>
        <Card>
            <SectionTitleLabel label='New Instance of {prototypeName}' formatParams={{prototypeName: prototype.name}}/>
            <Pad size={16} />
            <InstanceParamSetter param={nameParam} instanceGlobals={instanceGlobals} setInstanceGlobals={setInstanceGlobals} />
            <InstanceParamSetter param={languageParam} instanceGlobals={instanceGlobals} setInstanceGlobals={setInstanceGlobals} />

            {newInstanceParams.map(param =>
                <InstanceParamSetter key={param.key} param={param} instanceGlobals={instanceGlobals} setInstanceGlobals={setInstanceGlobals} />
            )}
            <Pad size={16} />
            <HorizBox spread>
                <PrimaryButton label='Create Live Instance' onPress={onCreate} />
                <SecondaryButton label='Cancel' onPress={onCancel} />
            </HorizBox>
        </Card>
    </Narrow>
}

const NewLiveInstanceScreenStyle = StyleSheet.create({
})


function InstanceParamSetter({param, instanceGlobals, setInstanceGlobals}) {
    const tEnter = useTranslation('Enter');
    const tPlaceholder = useTranslation(param.placeholder || null);
    if (param.type == 'shorttext') {
        return <FormField label={param.name}>
            <OneLineTextInput  
                placeholder={tPlaceholder ?? (tEnter + ' ' + param.name)}
                value={instanceGlobals[param.key] || ''} 
                onChange={text => setInstanceGlobals({...instanceGlobals, [param.key]: text})} />
        </FormField>
    } else if (param.type == 'select') {
        return <FormField label={param.name}>
            <PopupSelector items={param.options} value={instanceGlobals[param.key]} 
                onSelect={value => setInstanceGlobals({...instanceGlobals, [param.key]: value})}/>
        </FormField>
    } else {
        return <QuietSystemMessage label='Not yet'/>
    }
}

