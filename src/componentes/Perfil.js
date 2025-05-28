import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { auth, db } from '../../firebase/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function Perfil() {
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState('');
  const [telefono, setTelefono] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const user = auth.currentUser;
  const uid = user?.uid;

  useEffect(() => {
    if (!uid) return;
    const traerDatos = async () => {
      try {
        const docRef = doc(db, 'usuarios', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setNombre(data.nombre || '');
          setFecha(data.fecha || '');
          setTelefono(data.telefono || '');
        } else {
          Alert.alert('Usuario no encontrado');
        }
      } catch (e) {
        Alert.alert('Error al cargar datos');
      }
      setCargando(false);
    };
    traerDatos();
  }, [uid]);

  const actualizarDatos = async () => {
    if (!uid) {
      Alert.alert('Usuario no autenticado');
      return;
    }
    if (!nombre.trim() || !fecha.trim() || !telefono.trim()) {
      Alert.alert('Completa todos los campos');
      return;
    }
    setGuardando(true);
    try {
      const docRef = doc(db, 'usuarios', uid);
      await updateDoc(docRef, {
        nombre,
        fecha,
        telefono,
      });
      Alert.alert('Datos actualizados');
    } catch (error) {
      console.error(error);
      Alert.alert('Error al actualizar');
    }
    setGuardando(false);
  };

  if (cargando) return <Text style={styles.cargando}>Cargando...</Text>;

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Perfil del Usuario</Text>
      <Text style={styles.correo}>{user?.email}</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
      />

      <TextInput
        style={styles.input}
        placeholder="Fecha de nacimiento (YYYY-MM-DD)"
        value={fecha}
        onChangeText={setFecha}
      />

      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        value={telefono}
        onChangeText={setTelefono}
        keyboardType="phone-pad"
      />
      <Button title={guardando ? "Guardando..." : "Guardar cambios"} onPress={actualizarDatos} disabled={guardando} />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    padding: 20,
    flex: 1,
    backgroundColor: '#fff'
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  correo: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 10,
  },
  cargando: {
    marginTop: 50,
    textAlign: 'center',
  },
});