import { StyleSheet } from 'react-native';



const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#f3f6fa',
    minHeight: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3949ab',
    marginBottom: 24,
    textAlign: 'center',
  },
  addBtn: {
    backgroundColor: '#3949ab',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginBottom: 18,
    alignSelf: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  servicesBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    width: '100%',
    marginBottom: 24,
    elevation: 1,
  },
  serviceRow: {
    borderBottomWidth: 0.5,
    borderColor: '#e0e0e0',
    marginBottom: 12,
    paddingBottom: 8,
  },
  serviceType: {
    fontWeight: 'bold',
    color: '#1a237e',
    fontSize: 16,
    marginBottom: 2,
  },
  serviceDate: {
    color: '#3949ab',
    fontSize: 15,
    marginBottom: 2,
  },
  serviceCost: {
    color: '#333',
    fontSize: 15,
    marginBottom: 2,
  },
  actionsRow: {
    flexDirection: 'row-reverse',
    marginTop: 4,
  },
  editBtn: {
    marginLeft: 12,
  },
  editBtnText: {
    color: '#1976d2',
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteBtn: {
    marginLeft: 0,
  },
  deleteBtnText: {
    color: '#d32f2f',
    fontSize: 14,
    fontWeight: 'bold',
  },
  empty: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
  },
  backBtn: {
    marginTop: 16,
    backgroundColor: '#3949ab',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  backBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 3,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3949ab',
    marginBottom: 12,
    textAlign: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 3,
    textAlign: 'right',
    alignSelf: 'flex-end',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 7,
    padding: 8,
    fontSize: 15,
    marginBottom: 10,
    textAlign: 'right',
    backgroundColor: '#f9f9f9',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 7,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    height: 44,
    textAlign: 'right',
  },
  modalActions: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  saveBtn: {
    backgroundColor: '#3949ab',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelBtn: {
    backgroundColor: '#bbb',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  cancelBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Note Modal
  noteOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteModal: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3949ab',
    marginBottom: 12,
  },
  noteText: {
    fontSize: 16,
    color: '#222',
    marginBottom: 18,
    textAlign: 'right',
  },
  closeNoteBtn: {
    backgroundColor: '#3949ab',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  closeNoteBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
export default styles;