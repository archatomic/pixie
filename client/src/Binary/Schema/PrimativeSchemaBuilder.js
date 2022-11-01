import { AbstractSchemaBuilder } from './AbstractSchemaBuilder'

/**
 * @typedef {import('Pixie/Binary/Schema/Schema').UnpackFunc} UnpackFunc
 * @typedef {import('Pixie/Binary/Schema/Schema').PackFunc} PackFunc
 */

export class PrimativeSchemaBuilder extends AbstractSchemaBuilder
{
    /**
     * @param {PackFunc} fn
     * @returns {PrimativeSchemaBuilder}
     */
     pack (fn)
     {
         this._packFunc = fn
         return this
     }

     /**
      * @param {UnpackFunc} fn
      * @returns {PrimativeSchemaBuilder}
      */
     unpack (fn)
     {
         this._unpackFunc = fn
         return this
     }

    /**
     * @returns {PackFunc}
     */
     createPackFunc ()
     {
         return this._packFunc
     }

     /**
      * @returns {UnpackFunc}
      */
     createUnpackFunc ()
     {
         return this._unpackFunc
     }
}
