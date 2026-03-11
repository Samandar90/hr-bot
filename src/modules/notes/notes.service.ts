import { NotesRepository } from "./notes.repository";

export class NotesService {
  constructor(private readonly notesRepository: NotesRepository) {}

  async addNote(applicationId: string, note: string, adminTelegram: bigint) {
    return this.notesRepository.addNote(applicationId, note, adminTelegram);
  }
}
