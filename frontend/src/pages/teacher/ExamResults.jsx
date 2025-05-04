import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  Select,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Text,
  Flex,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  HStack,
  NumberInput,
  NumberInputField,
  Textarea
} from '@chakra-ui/react';
import { format } from 'date-fns';
import Layout from '../../components/layoutes/teacherlayout';
import authAxios from '../../utils/auth';

const ExamResults = () => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  // Fetch exams for teacher
  const fetchExams = async () => {
    try {
      const response = await authAxios.get('/exams/teacher');
      setExams(response.data.data);
    } catch (error) {
      toast({
        title: 'Error fetching exams',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  // Fetch students for selected exam's class
  const fetchStudents = async (examId) => {
    try {
      const exam = exams.find(e => e._id === examId);
      if (!exam) return;

      const response = await authAxios.get('/students?class=' + exam.class._id);
      setStudents(response.data.data);
      
      // Initialize results array with all students
      const initialResults = response.data.data.map(student => ({
        student: student._id,
        subjectResults: exam.subjects.map(subject => ({
          subject: subject._id,
          marksObtained: '',
          remarks: ''
        }))
      }));
      setResults(initialResults);
    } catch (error) {
      toast({
        title: 'Error fetching students',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleExamSelect = (examId) => {
    setSelectedExam(exams.find(e => e._id === examId));
    fetchStudents(examId);
    onOpen();
  };

  const handleMarksChange = (studentIndex, subjectIndex, value) => {
    const newResults = [...results];
    newResults[studentIndex].subjectResults[subjectIndex].marksObtained = value;
    setResults(newResults);
  };

  const handleRemarksChange = (studentIndex, subjectIndex, value) => {
    const newResults = [...results];
    newResults[studentIndex].subjectResults[subjectIndex].remarks = value;
    setResults(newResults);
  };

  const handleSubmit = async () => {
    if (!selectedExam) return;

    setLoading(true);
    try {
      // Validate marks
      const validationError = results.some(result =>
        result.subjectResults.some(sr =>
          sr.marksObtained === '' || 
          sr.marksObtained < 0 || 
          sr.marksObtained > selectedExam.totalMarks
        )
      );

      if (validationError) {
        throw new Error('Please enter valid marks for all students');
      }

      await authAxios.post('/exams/' + selectedExam._id + '/results', {
        results: results
      });

      toast({
        title: 'Success',
        description: 'Exam results submitted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error submitting results',
        description: error.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Upcoming': return 'blue';
      case 'Ongoing': return 'green';
      case 'Completed': return 'purple';
      case 'Cancelled': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Enter Exam Results</h1>
        </div>
        <div className="space-y-6">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Type</Th>
                <Th>Class</Th>
                <Th>Date</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {exams.map((exam) => (
                <Tr key={exam._id}>
                  <Td>{exam.name}</Td>
                  <Td>{exam.type}</Td>
                  <Td>{exam.class.name}</Td>
                  <Td>
                    {format(new Date(exam.startDate), 'dd/MM/yyyy')} -{' '}
                    {format(new Date(exam.endDate), 'dd/MM/yyyy')}
                  </Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(exam.status)}>
                      {exam.status}
                    </Badge>
                  </Td>
                  <Td>
                    <Button
                      colorScheme="blue"
                      size="sm"
                      onClick={() => handleExamSelect(exam._id)}
                      isDisabled={exam.status === 'Upcoming' || exam.status === 'Cancelled'}
                    >
                      Enter Results
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </div>

        <Modal isOpen={isOpen} onClose={onClose} size="6xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {selectedExam ? selectedExam.name : ''} Results
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                {selectedExam && (
                  <Accordion allowMultiple>
                    {students.map((student, studentIndex) => (
                      <AccordionItem key={student._id}>
                        <h2>
                          <AccordionButton>
                            <Box flex="1" textAlign="left">
                              {student.firstName} {student.lastName} (Roll: {student.rollNumber})
                            </Box>
                            <AccordionIcon />
                          </AccordionButton>
                        </h2>
                        <AccordionPanel>
                          <Table size="sm">
                            <Thead>
                              <Tr>
                                <Th>Subject</Th>
                                <Th>Marks (Max: {selectedExam.totalMarks})</Th>
                                <Th>Remarks</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {selectedExam.subjects.map((subject, subjectIndex) => (
                                <Tr key={subject._id}>
                                  <Td>{subject.name}</Td>
                                  <Td>
                                    <NumberInput
                                      max={selectedExam.totalMarks}
                                      min={0}
                                      value={results[studentIndex]?.subjectResults[subjectIndex]?.marksObtained}
                                      onChange={(value) => handleMarksChange(studentIndex, subjectIndex, value)}
                                    >
                                      <NumberInputField />
                                    </NumberInput>
                                  </Td>
                                  <Td>
                                    <Input
                                      placeholder="Optional remarks"
                                      value={results[studentIndex]?.subjectResults[subjectIndex]?.remarks}
                                      onChange={(e) => handleRemarksChange(studentIndex, subjectIndex, e.target.value)}
                                    />
                                  </Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                        </AccordionPanel>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleSubmit}
                isLoading={loading}
                loadingText="Submitting..."
              >
                Submit Results
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
      </div>
    </Layout>
  );
};

export default ExamResults;
