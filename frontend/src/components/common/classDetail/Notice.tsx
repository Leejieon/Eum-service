import React from 'react';
import { Text } from '@components/common/Text';
import { View, StyleSheet } from 'react-native';

function Notice(): React.JSX.Element {
    return (
        <View style={styles.notice}>
            <Text>Notice</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    notice: {
        flex: 1,
        backgroundColor: 'lightgray',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
});

export default Notice;
