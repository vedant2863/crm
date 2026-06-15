export interface Contact {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  location: string;
  status: "active" | "inactive" | "prospect";
  lastContact: string;
  createdAt: string;
}


export interface ModalState {
  add: boolean;
  edit: Contact | null;
}
