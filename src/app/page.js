import { redirect } from 'next/navigation';

export default function Home() {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    if (path.startsWith('/en')) {
      redirect('/en');
    } else {
      redirect('/th');
    }
  } else {
    redirect('/th');
  }
}
