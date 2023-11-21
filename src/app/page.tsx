import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center p-24">
     <Link href={'/note'} ><button className='btn btn-outline mx-4'>Go to Notes</button></Link>
     <Link href={'/card'} ><button className='btn btn-outline mx-4'>Go to Review</button></Link>
    </main>
  )
}
