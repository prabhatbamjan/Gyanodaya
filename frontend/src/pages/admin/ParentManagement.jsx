import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Select,
  Stack,
  Text,
  useDisclosure,
  IconButton
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, AddIcon } from '@chakra-ui/icons';
import Layout from '../../components/Layout';
import authAxios from '../../utils/auth';

const ParentManagement = () => {
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const toast = useToast();
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isAddChildOpen, onOpen: onAddChildOpen, onClose: onAddChildClose } = useDisclosure();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
  });

  const [selectedChild, setSelectedChild] = useState('');

  useEffect(() => {
    fetchParents();
    fetchStudents();
  }, []);

  const fetchParents = async () => {
    try {
      const response = await authAxios.get('/parents');
      setParents(response.data);
    } catch (error) {
      console.error('Error fetching parents:', error);
      toast({
        title: 'Error fetching parents',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await authAxios.get('/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: 'Error fetching students',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddParent = async () => {
    setLoading(true);
    try {
      await authAxios.post('/parents', formData);
      toast({
        title: 'Parent added successfully',
        status: 'success',
        duration: 3000,
      });
      fetchParents();
      onAddClose();
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        password: '',
      });
    } catch (error) {
      console.error('Error adding parent:', error);
      toast({
        title: 'Error adding parent',
        status: 'error',
        duration: 3000,
      });
    }
    setLoading(false);
  };

  const handleEditParent = async () => {
    setLoading(true);
    try {
      await authAxios.put(`/parents/${selectedParent._id}`, formData);
      toast({
        title: 'Parent updated successfully',
        status: 'success',
        duration: 3000,
      });
      fetchParents();
      onEditClose();
    } catch (error) {
      console.error('Error updating parent:', error);
      toast({
        title: 'Error updating parent',
        status: 'error',
        duration: 3000,
      });
    }
    setLoading(false);
  };

  const handleDeleteParent = async (id) => {
    if (window.confirm('Are you sure you want to delete this parent?')) {
      try {
        await authAxios.delete(`/parents/${id}`);
        toast({
          title: 'Parent deleted successfully',
          status: 'success',
          duration: 3000,
        });
        fetchParents();
      } catch (error) {
        console.error('Error deleting parent:', error);
        toast({
          title: 'Error deleting parent',
          status: 'error',
          duration: 3000,
        });
      }
    }
  };

  const handleAddChild = async () => {
    if (!selectedChild) {
      toast({
        title: 'Please select a child',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      await authAxios.post(`/parents/${selectedParent._id}/children`, {
        studentId: selectedChild,
      });
      toast({
        title: 'Child added to parent successfully',
        status: 'success',
        duration: 3000,
      });
      fetchParents();
      onAddChildClose();
      setSelectedChild('');
    } catch (error) {
      console.error('Error adding child to parent:', error);
      toast({
        title: 'Error adding child to parent',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const openEditModal = (parent) => {
    setSelectedParent(parent);
    setFormData({
      firstName: parent.firstName,
      lastName: parent.lastName,
      email: parent.email,
      phone: parent.phone,
      address: parent.address,
    });
    onEditOpen();
  };

  const openAddChildModal = (parent) => {
    setSelectedParent(parent);
    onAddChildOpen();
  };

  return (
    <Layout>
      <Container maxW="container.xl" py={8}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
          <Text fontSize="2xl" fontWeight="bold">Parent Management</Text>
          <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={onAddOpen}>
            Add New Parent
          </Button>
        </Box>

        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Phone</Th>
              <Th>Children</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {parents.map((parent) => (
              <Tr key={parent._id}>
                <Td>{`${parent.firstName} ${parent.lastName}`}</Td>
                <Td>{parent.email}</Td>
                <Td>{parent.phone}</Td>
                <Td>
                  {parent.children?.map(child => child.name).join(', ') || 'No children'}
                </Td>
                <Td>
                  <Stack direction="row" spacing={2}>
                    <IconButton
                      icon={<EditIcon />}
                      colorScheme="blue"
                      onClick={() => openEditModal(parent)}
                      size="sm"
                    />
                    <IconButton
                      icon={<DeleteIcon />}
                      colorScheme="red"
                      onClick={() => handleDeleteParent(parent._id)}
                      size="sm"
                    />
                    <IconButton
                      icon={<AddIcon />}
                      colorScheme="green"
                      onClick={() => openAddChildModal(parent)}
                      size="sm"
                      aria-label="Add child"
                    />
                  </Stack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        {/* Add Parent Modal */}
        <Modal isOpen={isAddOpen} onClose={onAddClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add New Parent</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack spacing={4}>
                <FormControl>
                  <FormLabel>First Name</FormLabel>
                  <Input name="firstName" value={formData.firstName} onChange={handleInputChange} />
                </FormControl>
                <FormControl>
                  <FormLabel>Last Name</FormLabel>
                  <Input name="lastName" value={formData.lastName} onChange={handleInputChange} />
                </FormControl>
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input name="email" type="email" value={formData.email} onChange={handleInputChange} />
                </FormControl>
                <FormControl>
                  <FormLabel>Phone</FormLabel>
                  <Input name="phone" value={formData.phone} onChange={handleInputChange} />
                </FormControl>
                <FormControl>
                  <FormLabel>Address</FormLabel>
                  <Input name="address" value={formData.address} onChange={handleInputChange} />
                </FormControl>
                <FormControl>
                  <FormLabel>Password</FormLabel>
                  <Input name="password" type="password" value={formData.password} onChange={handleInputChange} />
                </FormControl>
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onAddClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" onClick={handleAddParent} isLoading={loading}>
                Add Parent
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Edit Parent Modal */}
        <Modal isOpen={isEditOpen} onClose={onEditClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit Parent</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack spacing={4}>
                <FormControl>
                  <FormLabel>First Name</FormLabel>
                  <Input name="firstName" value={formData.firstName} onChange={handleInputChange} />
                </FormControl>
                <FormControl>
                  <FormLabel>Last Name</FormLabel>
                  <Input name="lastName" value={formData.lastName} onChange={handleInputChange} />
                </FormControl>
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input name="email" type="email" value={formData.email} onChange={handleInputChange} />
                </FormControl>
                <FormControl>
                  <FormLabel>Phone</FormLabel>
                  <Input name="phone" value={formData.phone} onChange={handleInputChange} />
                </FormControl>
                <FormControl>
                  <FormLabel>Address</FormLabel>
                  <Input name="address" value={formData.address} onChange={handleInputChange} />
                </FormControl>
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onEditClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" onClick={handleEditParent} isLoading={loading}>
                Update Parent
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Add Child Modal */}
        <Modal isOpen={isAddChildOpen} onClose={onAddChildClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add Child to Parent</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl>
                <FormLabel>Select Child</FormLabel>
                <Select
                  placeholder="Select a student"
                  value={selectedChild}
                  onChange={(e) => setSelectedChild(e.target.value)}
                >
                  {students
                    .filter(student => !selectedParent?.children?.some(child => child._id === student._id))
                    .map((student) => (
                      <option key={student._id} value={student._id}>
                        {`${student.firstName} ${student.lastName} - ${student.grade}`}
                      </option>
                    ))}
                </Select>
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onAddChildClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" onClick={handleAddChild}>
                Add Child
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>
    </Layout>
  );
};

export default ParentManagement;
