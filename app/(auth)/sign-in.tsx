import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase.config';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthProvider';

const SignIn: React.FC = () => {
    const { setUser } = useAuth();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const router = useRouter();

    const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (value: string) => {
        setter(value);
        if (errorMessage) {
            setErrorMessage(null);
        }
    };

    const handleSignIn = async () => {
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            setUser(user); // Set user in context
            // Navigate to the home screen or any other screen
            router.push('/'); // Adjust the route as per your navigation setup
        } catch (error) {
            setErrorMessage((error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F0F0', padding: 16 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Sign In</Text>

            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={handleInputChange(setEmail)}
                keyboardType="email-address"
                style={{ backgroundColor: 'white', padding: 12, borderRadius: 8, borderColor: 'gray', borderWidth: 1, width: '100%', marginBottom: 8 }}
            />

            <TextInput
                placeholder="Password"
                value={password}
                onChangeText={handleInputChange(setPassword)}
                secureTextEntry
                style={{ backgroundColor: 'white', padding: 12, borderRadius: 8, borderColor: 'gray', borderWidth: 1, width: '100%', marginBottom: 8 }}
            />

            {errorMessage && (
                <Text style={{ color: 'red', marginBottom: 8 }}>{errorMessage}</Text>
            )}

            <Pressable onPress={handleSignIn} disabled={loading} className='bg-green-600 p-3 rounded-full w-full'>
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={{ textAlign: 'center', color: 'white', fontWeight: 'bold' }}>Sign In</Text>
                )}
            </Pressable>

            <View style={{ marginTop: 16 }}>
                <Text>
                    Don't have an account?{' '}
                    <Text style={{ color: '#007BFF', fontWeight: 'bold' }} onPress={() => router.push('/sign-up')}>Sign Up</Text>
                </Text>
            </View>
        </View>
    );
};

export default SignIn;
