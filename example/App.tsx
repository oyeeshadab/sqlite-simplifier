import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  Database,
  insert,
  select,
  selectAll,
  selectById,
  update,
  updateById,
  deleteRecords,
  deleteById,
  dropTable,
  where,
} from 'sqlite-simplifier';

// Initialize database
const db = new Database({ name: 'myapp.db' });

interface User {
  id?: number;
  name: string;
  email: string;
  age: number;
}

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    initDatabase();
    loadUsers();
  }, []);

  const initDatabase = async () => {
    await db.connect();
    // Create table with simplified schema
    await db.createTable('users', {
      id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
      name: 'TEXT NOT NULL',
      email: 'TEXT UNIQUE',
      age: 'INTEGER',
    });
  };

  const loadUsers = async () => {
    // SIMPLIFIED: Just pass table name!
    const allUsers = await selectAll<User>(db, 'users');
    setUsers(allUsers);
  };

  const handleInsert = async () => {
    if (!name || !email) {
      Alert.alert('Error', 'Please fill name and email');
      return;
    }

    // SIMPLIFIED: Just pass table and data!
    const id = await insert(db, 'users', {
      name,
      email,
      age: parseInt(age) || 0,
    });

    Alert.alert('Success', `User inserted with ID: ${id}`);
    clearForm();
    loadUsers();
  };

  const handleUpdate = async () => {
    if (!editingId) return;

    // SIMPLIFIED: Update by ID with simple function!
    await updateById(db, 'users', editingId, {
      name,
      email,
      age: parseInt(age) || 0,
    });

    Alert.alert('Success', 'User updated successfully');
    clearForm();
    loadUsers();
  };

  const handleDelete = async (id: number) => {
    // SIMPLIFIED: Delete by ID!
    await deleteById(db, 'users', id);
    Alert.alert('Success', 'User deleted');
    loadUsers();
  };

  const handleSelectWithCondition = async () => {
    // SIMPLIFIED: Select with where condition!
    const adults = await select<User>(db, 'users', where('age', '>=', 18));
    Alert.alert('Adults', JSON.stringify(adults, null, 2));
  };

  const handleSelectById = async (id: number) => {
    // SIMPLIFIED: Select by ID!
    const user = await selectById<User>(db, 'users', id);
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setAge(user.age.toString());
      setEditingId(user.id || null);
    } else {
      Alert.alert('Not Found', 'User not found');
    }
  };

  const handleDropTable = async () => {
    Alert.alert(
      'Warning',
      'This will delete the entire users table!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            // SIMPLIFIED: Drop table with one function!
            await dropTable(db, 'users', true);
            await initDatabase(); // Recreate
            loadUsers();
            Alert.alert('Success', 'Table recreated');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const clearForm = () => {
    setName('');
    setEmail('');
    setAge('');
    setEditingId(null);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>SQLite Simplifier Demo</Text>

      {/* Form */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Age"
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
        />

        <TouchableOpacity
          style={styles.button}
          onPress={editingId ? handleUpdate : handleInsert}
        >
          <Text style={styles.buttonText}>
            {editingId ? 'Update User' : 'Insert User'}
          </Text>
        </TouchableOpacity>

        {editingId && (
          <TouchableOpacity style={styles.cancelButton} onPress={clearForm}>
            <Text style={styles.buttonText}>Cancel Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Demo Buttons */}
      <View style={styles.demoButtons}>
        <TouchableOpacity style={styles.demoButton} onPress={handleSelectWithCondition}>
          <Text style={styles.demoButtonText}>Select Adults (Age >= 18)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dangerButton} onPress={handleDropTable}>
          <Text style={styles.buttonText}>Drop & Recreate Table</Text>
        </TouchableOpacity>
      </View>

      {/* Users List */}
      <Text style={styles.subtitle}>Users ({users.length})</Text>
      {users.map((user) => (
        <View key={user.id} style={styles.userCard}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <Text style={styles.userAge}>Age: {user.age}</Text>
          </View>
          <View style={styles.userActions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleSelectById(user.id!)}
            >
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(user.id!)}
            >
              <Text style={styles.actionText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#555',
  },
  form: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: '#666',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  demoButtons: {
    marginBottom: 20,
  },
  demoButton: {
    backgroundColor: '#34C759',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  demoButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  userCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  userAge: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  userActions: {
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
    marginRight: 5,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});