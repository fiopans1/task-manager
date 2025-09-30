import { successToast, errorToast, infoToast, warningToast } from '../Noty';
import { toast } from 'react-toastify';

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}));

describe('Noty utility functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('successToast', () => {
    it('should call toast.success with the provided message', () => {
      const message = 'Operation successful!';
      successToast(message);

      expect(toast.success).toHaveBeenCalledWith(message, expect.any(Object));
    });

    it('should call toast.success with default options', () => {
      const message = 'Success!';
      successToast(message);

      expect(toast.success).toHaveBeenCalledWith(
        message,
        expect.objectContaining({
          position: expect.any(String),
          autoClose: expect.any(Number),
        })
      );
    });
  });

  describe('errorToast', () => {
    it('should call toast.error with the provided message', () => {
      const message = 'An error occurred!';
      errorToast(message);

      expect(toast.error).toHaveBeenCalledWith(message, expect.any(Object));
    });

    it('should call toast.error with default options', () => {
      const message = 'Error!';
      errorToast(message);

      expect(toast.error).toHaveBeenCalledWith(
        message,
        expect.objectContaining({
          position: expect.any(String),
          autoClose: expect.any(Number),
        })
      );
    });
  });

  describe('infoToast', () => {
    it('should call toast.info with the provided message', () => {
      const message = 'Information message';
      infoToast(message);

      expect(toast.info).toHaveBeenCalledWith(message, expect.any(Object));
    });
  });

  describe('warningToast', () => {
    it('should call toast.warning with the provided message', () => {
      const message = 'Warning message';
      warningToast(message);

      expect(toast.warning).toHaveBeenCalledWith(message, expect.any(Object));
    });
  });

  describe('message formatting', () => {
    it('should handle empty string messages', () => {
      successToast('');
      expect(toast.success).toHaveBeenCalledWith('', expect.any(Object));
    });

    it('should handle long messages', () => {
      const longMessage = 'This is a very long message that should still be displayed correctly in the toast notification';
      successToast(longMessage);
      expect(toast.success).toHaveBeenCalledWith(longMessage, expect.any(Object));
    });

    it('should handle special characters in messages', () => {
      const specialMessage = 'Error: <script>alert("XSS")</script>';
      errorToast(specialMessage);
      expect(toast.error).toHaveBeenCalledWith(specialMessage, expect.any(Object));
    });
  });
});
