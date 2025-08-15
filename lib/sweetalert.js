import Swal from 'sweetalert2'

// Success alert
export const showSuccess = (title, message = '') => {
  return Swal.fire({
    icon: 'success',
    title: title,
    text: message,
    confirmButtonText: 'ตกลง',
    confirmButtonColor: '#10B981'
  })
}

// Error alert
export const showError = (title, message = '') => {
  return Swal.fire({
    icon: 'error',
    title: title,
    text: message,
    confirmButtonText: 'ตกลง',
    confirmButtonColor: '#EF4444'
  })
}

// Warning alert
export const showWarning = (title, message = '') => {
  return Swal.fire({
    icon: 'warning',
    title: title,
    text: message,
    confirmButtonText: 'ตกลง',
    confirmButtonColor: '#F59E0B'
  })
}

// Info alert
export const showInfo = (title, message = '') => {
  return Swal.fire({
    icon: 'info',
    title: title,
    text: message,
    confirmButtonText: 'ตกลง',
    confirmButtonColor: '#3B82F6'
  })
}

// Confirmation dialog
export const showConfirm = (title, message = '', confirmText = 'ยืนยัน', cancelText = 'ยกเลิก') => {
  return Swal.fire({
    icon: 'question',
    title: title,
    text: message,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: '#10B981',
    cancelButtonColor: '#6B7280',
    reverseButtons: true
  })
}

// Delete confirmation
export const showDeleteConfirm = (title = 'ยืนยันการลบ', message = 'คุณแน่ใจหรือไม่ที่จะลบรายการนี้?') => {
  return Swal.fire({
    icon: 'warning',
    title: title,
    text: message,
    showCancelButton: true,
    confirmButtonText: 'ลบ',
    cancelButtonText: 'ยกเลิก',
    confirmButtonColor: '#EF4444',
    cancelButtonColor: '#6B7280',
    reverseButtons: true
  })
}

// Loading alert
export const showLoading = (title = 'กำลังดำเนินการ...') => {
  return Swal.fire({
    title: title,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading()
    }
  })
}

// Close loading
export const closeLoading = () => {
  Swal.close()
}

// Form validation error
export const showValidationError = (errors) => {
  let errorMessage = ''
  if (typeof errors === 'string') {
    errorMessage = errors
  } else if (Array.isArray(errors)) {
    errorMessage = errors.join('\n')
  } else if (typeof errors === 'object') {
    errorMessage = Object.values(errors).join('\n')
  }
  
  return Swal.fire({
    icon: 'error',
    title: 'เกิดข้อผิดพลาด',
    text: errorMessage,
    confirmButtonText: 'ตกลง',
    confirmButtonColor: '#EF4444'
  })
}

// Toast notification
export const showToast = (title, icon = 'success') => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  })

  Toast.fire({
    icon: icon,
    title: title
  })
}
