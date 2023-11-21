import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center p-24">
     <button className='btn btn-outline mx-4'><Link href={'/note'} >Go to Notes</Link></button>
     <button className='btn btn-outline mx-4'><Link href={'/card'} >Go to Review</Link></button>
    </main>
  )
}
