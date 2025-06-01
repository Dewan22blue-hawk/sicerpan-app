import Swal from 'sweetalert2';

const NotificationHelper = {
  // Untuk notifikasi sukses
  showSuccess: (message) => {
    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: message,
      showConfirmButton: false,
      timer: 2000, // Notifikasi akan hilang setelah 2 detik
      timerProgressBar: true,
      customClass: {
        popup: 'swal2-responsive-popup', // Kelas kustom untuk responsivitas tambahan
      },
    });
  },

  // Untuk notifikasi error
  showError: (message) => {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: message,
      showConfirmButton: true, // Biarkan pengguna klik OK untuk error
      customClass: {
        popup: 'swal2-responsive-popup',
      },
    });
  },

  // Untuk notifikasi info/warning
  showInfo: (message) => {
    Swal.fire({
      icon: 'info',
      title: 'Informasi',
      text: message,
      showConfirmButton: true,
      customClass: {
        popup: 'swal2-responsive-popup',
      },
    });
  },

  // Untuk konfirmasi (misal: "Apakah Anda yakin ingin menghapus?")
  showConfirmation: async (title, text) => {
    const result = await Swal.fire({
      title: title,
      text: text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Lanjutkan!',
      cancelButtonText: 'Batal',
      customClass: {
        popup: 'swal2-responsive-popup',
      },
    });
    return result.isConfirmed; // Mengembalikan true jika pengguna klik 'Ya'
  },
};

export default NotificationHelper;
