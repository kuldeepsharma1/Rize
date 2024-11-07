import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../../firebase.config';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthProvider';

const Signup: React.FC = () => {
    const { setUser } = useAuth();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [emailSent, setEmailSent] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const router = useRouter();

    const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (value: string) => {
        setter(value);
        if (errorMessage) {
            setErrorMessage(null);
        }
    };

    const handleSignup = async () => {
        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match.");
            return;
        }
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await sendEmailVerification(user);
            setUser(user);
            alert('Verification email sent! Please check your inbox');
            setEmailSent(true);
            setEmail('');
            setPassword('');
            setConfirmPassword('');
        } catch (error) {
            setErrorMessage((error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F0F0', padding: 16 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Sign up</Text>

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

            <TextInput
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={handleInputChange(setConfirmPassword)}
                secureTextEntry
                style={{ backgroundColor: 'white', padding: 12, borderRadius: 8, borderColor: 'gray', borderWidth: 1, width: '100%', marginBottom: 8 }}
            />

            {errorMessage && (
                <Text style={{ color: 'red', marginBottom: 8 }}>{errorMessage}</Text>
            )}

            {!emailSent ? (
                <Pressable onPress={handleSignup} disabled={loading} className='bg-green-600 p-3 rounded-full w-full' >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={{ textAlign: 'center', color: 'white', fontWeight: 'bold' }}>Sign up</Text>
                    )}
                </Pressable>
            ) : (
                <Text style={{ color: 'green', marginTop: 8 }}>
                    A verification email has been sent to your email address. Please verify your email before logging in!
                </Text>
            )}

            <View style={{ marginTop: 16 }}>
                <Text>
                    Already have an account?{' '}
                    <Text style={{ color: '#007BFF', fontWeight: 'bold' }} onPress={() => router.push('/(auth)/sign-in')}>Sign In</Text>
                </Text>
            </View>
        </View>
    );
};

export default Signup;
