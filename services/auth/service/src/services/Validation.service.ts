

export class ValidationService  {


  isValidID(id: string) {
    if (!id || id.length !== 36 || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
      return false;
    }

    return true;
  }
}
